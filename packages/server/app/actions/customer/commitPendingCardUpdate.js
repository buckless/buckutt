module.exports = async (ctx, id) => await ctx.models.PendingCardUpdate.where({ id }).destroy();
