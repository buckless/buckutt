module.exports = async ctx => {
    const date = new Date();

    const start = ctx.event.accountRefundStart;
    const end = ctx.event.accountRefundEnd;

    const reloads = await ctx.models.Reload.where({ buyer_id: ctx.user.id }).fetchAll({
        withRelated: ['point']
    });
    const pendingCardUpdates = await ctx.models.PendingCardUpdate.where({
        user_id: ctx.user.id
    }).fetchAll();
    const alreadyAsked = await ctx.models.Refund.where({
        type: 'card',
        trace: 'account-refund',
        buyer_id: ctx.user.id
    }).fetch();

    const maxRefund = reloads
        .toJSON()
        .filter(reload => reload.type === 'card' && reload.point.name === 'Internet')
        .map(reload => reload.credit)
        .reduce((a, b) => a + b, 0);
    const pendingCredit = pendingCardUpdates.toJSON().reduce((a, b) => a + b.amount, 0);

    const refundable = Math.min(maxRefund, ctx.user.credit + pendingCredit);

    const allowed =
        date >= start &&
        date <= end &&
        ctx.event.minimumAccountRefund > 0 &&
        refundable >= ctx.event.minimumAccountRefund &&
        !alreadyAsked;

    return {
        allowed,
        start,
        end,
        alreadyAsked,
        pendingCredit,
        refundable: refundable,
        minimum: ctx.event.minimumAccountRefund
    };
};
