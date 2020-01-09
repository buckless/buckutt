const creditWallet = require('server/app/helpers/creditWallet');
const getAmountToReload = require('server/app/utils/getAmountToReload');

module.exports = async (ctx, { transaction }) => {
    if (transaction.isAuthorization) {
        return;
    }

    const { GiftReload, Reload } = ctx.models;
    const amount = getAmountToReload(ctx.event, transaction.amount);

    const newReload = new Reload({
        credit: amount,
        type: 'card',
        trace: transaction.id,
        point_id: ctx.point.id,
        wallet_id: transaction.wallet_id,
        seller_id: transaction.user_id
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
        wallet_id: transaction.wallet_id,
        seller_id: transaction.user_id
    });

    const reloadGiftSave = reloadGiftAmount ? reloadGift.save() : Promise.resolve();

    const updateWallet = creditWallet(ctx, transaction.wallet_id, amount + reloadGiftAmount);

    await Promise.all([newReload.save(), updateWallet, reloadGiftSave]);
};
