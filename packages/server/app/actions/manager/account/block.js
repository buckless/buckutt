module.exports = async (ctx, { wallet_id }) => {
    await new ctx.models.Wallet({ id: wallet_id }).save({ blocked: true }, { patch: true });
};
