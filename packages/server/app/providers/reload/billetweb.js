const axios = require('axios');
const config = require('server/app/config');
const ctx = require('server/app/utils/ctx');
const processReload = require('server/app/helpers/processReload');
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
        const { Transaction } = req.app.locals.models;

        if (!req.query.form_data) {
            throw new APIError(module, 404, 'Missing form_data');
        }

        let formData = JSON.parse(req.query.form_data);

        if (!formData[0] || !formData[0]['10037']) {
            throw new APIError(module, 404, 'Missing field 10037');
        }

        formData = formData[0];

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
        transaction.set('state', ticket.order_paid ? 'SUCCESS' : 'FAILED');

        await transaction.save();

        if (transaction.get('state') === 'SUCCESS') {
            await processReload(ctx(req), { transaction: transaction.toJSON() });
        }

        res.json({});
    }
};
