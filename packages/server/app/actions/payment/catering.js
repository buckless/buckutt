const createWallet = require('server/app/helpers/createWallet');

module.exports = async (ctx, { walletId, name, cateringId, clientTime }) => {
    let wallet = await ctx.models.Wallet.where({
        logical_id: walletId,
        blocked: false
    })
        .fetch()
        .then(wallet => (wallet ? wallet.toJSON() : null));

    if (!wallet) {
        wallet = await createWallet(ctx, {
            logicalId: walletId,
            clientTime
        });
    }

    await new ctx.models.Withdrawal({
        seller_id: ctx.user.id,
        wallet_id: wallet.id,
        point_id: ctx.point.id,
        name,
        cateringId,
        clientTime
    }).save();
};
