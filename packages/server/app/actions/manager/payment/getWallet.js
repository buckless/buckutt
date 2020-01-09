module.exports = async (ctx, { id, physical_id }) => {
    const where = id ? { id } : { physical_id };

    const wallet = await ctx.models.Wallet.where(where).fetch({ require: true });

    return wallet.toJSON();
};
