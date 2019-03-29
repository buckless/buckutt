const axios = require('axios');
const config = require('server/app/config');
const ctx = require('server/app/utils/ctx');
const creditWallet = require('server/app/helpers/creditWallet');
const APIError = require('server/app/utils/APIError');

const providerConfig = config.provider.checkout;

const onlinePayment = async (ctx, data) => {
    const { Transaction, GiftReload, Reload } = ctx.models;

    const transaction = new Transaction({
        state: 'pending',
        amount: data.amount,
        wallet_id: data.wallet.id,
        user_id: data.buyer.id
    });

    await transaction.save();

    const url = `${providerConfig.api}/charges/token`;
    const body = {
        email: data.buyer.mail,
        cardToken: data.cardToken,
        value: data.amount,
        currency: 'EUR',
        trackId: transaction.get('id')
    };

    const headers = {
        'Authorization': providerConfig.privateKey,
        'Content-Type': 'application/json'
    };

    let result;
    try {
        result = await axios.post(url, body, { headers });

        transaction.set('state', result.data.responseMessage === 'Approved' ? 'SUCCESS' : 'FAILED');
        transaction.set('transactionId', result.data.id);
    } catch (err) {
        console.log(err);
        transaction.set('state', 'FAILED');
    }

    const amount = transaction.get('amount');

    if (transaction.get('state') === 'SUCCESS') {
        transaction.set('cardToken', result.data.card.id);

        const newReload = new Reload({
            credit: amount,
            type: 'card',
            trace: transaction.get('id'),
            point_id: ctx.point.id,
            wallet_id: transaction.get('wallet_id'),
            seller_id: transaction.get('user_id')
        });

        const giftReloads = await GiftReload.fetchAll().then(grs =>
            grs && grs.length ? grs.toJSON() : []
        );

        const reloadGiftAmount = giftReloads
            .filter(gr => amount >= gr.minimalAmount)
            .map(gr => Math.floor(amount / gr.everyAmount) * gr.amount)
            .reduce((a, b) => a + b, 0);

        const reloadGift = new Reload({
            credit: reloadGiftAmount,
            type: 'gift',
            trace: `card-${amount}`,
            point_id: ctx.point.id,
            wallet_id: transaction.get('wallet_id'),
            seller_id: transaction.get('user_id')
        });

        const reloadGiftSave = reloadGiftAmount ? reloadGift.save() : Promise.resolve();

        const updateWallet = creditWallet(ctx, transaction.get('wallet_id'), amount);

        await Promise.all([newReload.save(), transaction.save(), updateWallet, reloadGiftSave]);
    } else {
        await transaction.save();

        return { type: 'url', res: '/reload/failed' };
    }

    return { type: 'url', res: '/reload/success' };
};

module.exports = {
    setup(req, _, next) {
        req.onlinePayment = data => onlinePayment(ctx(req), data);
        next();
    },

    async callback(req, res) {
        // There's no callback with checkout, unless 3DSecure is active
        res.json({});
    }
};
