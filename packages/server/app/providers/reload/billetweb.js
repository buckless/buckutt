const axios = require('axios');
const config = require('server/app/config');
const ctx = require('server/app/utils/ctx');
const creditWallet = require('server/app/helpers/creditWallet');
const APIError = require('server/app/utils/APIError');

const providerConfig = config.provider.billetweb;

const onlinePayment = async (ctx, data) => {
    const transaction = new ctx.models.Transaction({
        state: 'pending',
        amount: data.amount,
        wallet_id: data.wallet.id,
        user_id: data.buyer.id
    });

    await transaction.save();

    const formData = JSON.stringify([
        {
            1: encodeURIComponent(data.buyer.mail),
            2: encodeURIComponent(data.buyer.lastname),
            3: encodeURIComponent(data.buyer.firstname),
            10037: transaction.get('id')
        }
    ]);

    const query = [
        `form_data=${formData}`,
        `price=${data.amount / 100}`,
        `ticket=${providerConfig.ticket}`
    ];

    const res = providerConfig.url + '&' + query.join('&');

    return {
        type: 'url',
        res
    };
};

module.exports = {
    setup(req, _, next) {
        req.onlinePayment = data => onlinePayment(ctx(req), data);
        next();
    },

    async callback(req, res) {
        const { Transaction, GiftReload, Reload } = req.app.locals.models;

        if (!req.query.form_data) {
            throw new APIError(module, 404, 'Missing form_data');
        }

        let formData = JSON.parse(req.query.form_data);

        if (!formData[0] || !formData[0]['10037']) {
            throw new APIError(module, 404, 'Missing field 10037');
        }

        formData = formData[0];

        const giftReloads = await GiftReload.fetchAll().then(grs =>
            grs && grs.length ? grs.toJSON() : []
        );

        const transaction = await Transaction.where({ id: formData['10037'] }).fetch({
            withRelated: ['user'],
            require: true
        });

        const url = `https://www.billetweb.fr/api/event/${providerConfig.event}/attendees`;

        const params = {
            user: providerConfig.user,
            key: providerConfig.key,
            version: providerConfig.version
        };

        const result = await axios.get(url, { params });

        const ticket = result.data.find(t => t.custom_order.Transaction === transaction.get('id'));

        if (!ticket) {
            return res
                .status(302)
                .header('Location', `${config.urls.managerUrl}/reload/failed`)
                .end();
        }

        transaction.set('amount', Math.floor(ticket.price * 100));

        const amount = transaction.get('amount');

        transaction.set('state', ticket.order_paid ? 'SUCCESS' : 'FAILED');

        if (transaction.get('state') === 'SUCCESS') {
            transaction.set('active', null);
            transaction.set('deleted_at', new Date());

            const newReload = new Reload({
                credit: amount,
                type: 'card',
                trace: transaction.get('id'),
                point_id: req.point.id,
                wallet_id: transaction.get('wallet_id'),
                seller_id: transaction.get('user_id')
            });

            const reloadGiftAmount = giftReloads
                .filter(gr => amount >= gr.minimalAmount)
                .map(gr => Math.floor(amount / gr.everyAmount) * gr.amount)
                .reduce((a, b) => a + b, 0);

            const reloadGift = new Reload({
                credit: reloadGiftAmount,
                type: 'gift',
                trace: `card-${amount}`,
                point_id: req.point.id,
                wallet_id: transaction.get('wallet_id'),
                seller_id: transaction.get('user_id')
            });

            const reloadGiftSave = reloadGiftAmount ? reloadGift.save() : Promise.resolve();

            const updateWallet = creditWallet(ctx(req), transaction.get('wallet_id'), amount);

            await Promise.all([newReload.save(), transaction.save(), updateWallet, reloadGiftSave]);
        } else {
            await transaction.save();
        }

        res.json({});
    }
};
