module.exports = async (ctx, { id }) => {
    const wallet = await ctx.models.Wallet.where({ id }).fetch({ require: true });

    return wallet.toJSON();
};
