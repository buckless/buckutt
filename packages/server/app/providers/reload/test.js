const uuid = require('uuid');
const randomstring = require('randomstring');
const config = require('server/app/config');
const processReload = require('server/app/helpers/processReload');
const ctx = require('server/app/utils/ctx');

const onlinePayment = async (ctx, data) => {
    const Transaction = ctx.models.Transaction;
    const type = data.type || 'reload';

    const transaction = new Transaction({
        state: 'pending',
        amount: data.amount,
        wallet_id: data.wallet.id,
        user_id: data.buyer.id,
        isAuthorization: type === 'refund'
    });

    await transaction.save();

    setTimeout(() => fakeCallback(ctx, transaction.get('id'), data), 5000);

    return {
        type: 'url',
        res: `${config.urls.managerUrl}/${type}/success`
    };
};

const fakeCallback = async (ctx, id, data) => {
    if (!ctx || !id || !data) {
        // disable callback as a router (called from controllers)
        return () => {};
    }

    const { Transaction } = ctx.models;

    const transaction = await Transaction.where({ id }).fetch();

    transaction.set('transactionId', uuid());
    transaction.set('state', 'ACCEPTED');
    transaction.set('cardToken', randomstring.generate());
    transaction.set('cardExpiration', '1234');
    transaction.set('cardType', 'CB');

    await transaction.save();

    if (transaction.get('state') === 'ACCEPTED') {
        await processReload(ctx, { transaction: transaction.toJSON() });
    }
};

module.exports = {
    setup(req, _, next) {
        req.onlinePayment = data => onlinePayment(ctx(req), data);
        next();
    },

    callback() {}
};
