const creditUser = require('server/app/helpers/creditUser');

module.exports = async (ctx, id) => {
    const pendingCardUpdate = await ctx.models.PendingCardUpdate.where({ id })
        .fetch({ require: true })
        .then(pcu => (pcu ? pcu.toJSON() : null));

    await ctx.models.PendingCardUpdate.where({ id }).destroy();
    await creditUser(ctx, pendingCardUpdate.user_id, pendingCardUpdate.amount);
};
