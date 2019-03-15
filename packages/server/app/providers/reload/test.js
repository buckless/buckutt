const uuid = require('uuid');
const config = require('server/app/config');
const creditWallet = require('server/app/helpers/creditWallet');
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

    const { Transaction, GiftReload, Reload } = ctx.models;

    const useCardData = ctx.event.useCardData;
    const giftReloads = await GiftReload.fetchAll().then(grs =>
        grs && grs.length ? grs.toJSON() : []
    );

    const transaction = await Transaction.where({ id }).fetch();

    transaction.set('transactionId', uuid());
    transaction.set('state', 'ACCEPTED');

    if (transaction.get('state') === 'ACCEPTED') {
        const amount = transaction.get('amount');

        const newReload = new Reload({
            credit: amount,
            type: 'card',
            trace: transaction.get('id'),
            point_id: data.point,
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
            point_id: data.point,
            wallet_id: transaction.get('wallet_id'),
            seller_id: transaction.get('user_id')
        });

        const reloadGiftSave = reloadGiftAmount ? reloadGift.save() : Promise.resolve();

        const updateWallet = creditWallet(
            { ...ctx, event: { useCardData }, point: { name: 'Internet' } },
            transaction.get('wallet_id'),
            amount
        );

        return Promise.all([newReload.save(), transaction.save(), updateWallet, reloadGiftSave]);
    } else {
        return transaction.save();
    }
};

module.exports = {
    setup(req, _, next) {
        req.onlinePayment = data => onlinePayment(ctx(req), data);
        next();
    },

    callback() {}
};
