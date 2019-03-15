module.exports = async (ctx, { walletId, wiketId, clientTime }) => {
    const wallet = await ctx.models.Wallet.where({ logical_id: walletId, blocked: false })
        .fetch()
        .then(wallet => (wallet ? wallet.toJSON() : null));

    await new ctx.models.Access({
        wallet_id: wallet.id,
        operator_id: ctx.user.id,
        wiket_id: wiketId,
        clientTime
    }).save();
};
