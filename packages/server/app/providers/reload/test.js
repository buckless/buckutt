const uuid = require('uuid');
const config = require('server/app/config');
const processReload = require('server/app/helpers/processReload');
const ctx = require('server/app/utils/ctx');

const onlinePayment = async (ctx, data) => {
    const Transaction = ctx.models.Transaction;

    const transaction = new Transaction({
        state: 'pending',
        amount: data.amount,
        wallet_id: data.wallet.id,
        user_id: data.buyer.id
    });

    await transaction.save();

    setTimeout(() => fakeCallback(ctx, transaction.get('id'), data), 5000);

    return {
        type: 'url',
        res: `${config.urls.managerUrl}/reload/success`
    };
};

const fakeCallback = async (ctx, id, data) => {
    if (!ctx || !id || !data) {
        // disable callback as a router (called from controllers)
        return () => {};
    }

    const { Transaction } = ctx.models;

    const useCardData = ctx.event.useCardData;
    const fakeCtx = { ...ctx, event: { useCardData }, point: { name: 'Internet' } };

    const transaction = await Transaction.where({ id }).fetch();

    transaction.set('transactionId', uuid());
    transaction.set('state', 'ACCEPTED');

    await transaction.save();

    if (transaction.get('state') === 'ACCEPTED') {
        await processReload(fakeCtx, { transaction: transaction.toJSON() });
    }
};

module.exports = {
    setup(req, _, next) {
        req.onlinePayment = data => onlinePayment(ctx(req), data);
        next();
    },

    callback() {}
};
