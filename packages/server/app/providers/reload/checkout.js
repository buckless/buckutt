const axios = require('axios');
const config = require('server/app/config');
const ctx = require('server/app/utils/ctx');
const processReload = require('server/app/helpers/processReload');
const APIError = require('server/app/utils/APIError');

const providerConfig = config.provider.checkout;

const onlinePayment = async (ctx, data) => {
    const { Transaction } = ctx.models;

    const transaction = new Transaction({
        state: 'pending',
        amount: data.amount,
        wallet_id: data.wallet.id,
        user_id: data.buyer.id
    });

    await transaction.save();

    const url = `${providerConfig.api}/payments`;
    const body = {
        source: {
            type: "token",
            token: data.cardToken
        },
        amount: data.amount,
        currency: 'EUR',
        reference: transaction.get('id')
    };

    const headers = {
        'Authorization': providerConfig.privateKey,
        'Content-Type': 'application/json'
    };

    let result;
    try {
        result = await axios.post(url, body, { headers });
        console.log(result);
        transaction.set('state', result.data.approved ? 'SUCCESS' : 'FAILED');
        transaction.set('transactionId', result.data.id);
    } catch (err) {
        console.log(err);
        transaction.set('state', 'FAILED');
    }

    if (transaction.get('state') === 'SUCCESS') {
        transaction.set('cardToken', result.data.source.id);
        await transaction.save();
        await processReload(ctx, { transaction: transaction.toJSON() });
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
