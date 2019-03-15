module.exports = async (ctx, { wallet }) => {
    const date = new Date();

    const start = ctx.event.accountRefundStart;
    const end = ctx.event.accountRefundEnd;

    const reloads = await ctx.models.Reload.where({ wallet_id: wallet.id }).fetchAll({
        withRelated: ['point']
    });
    const alreadyAsked = await ctx.models.Refund.where({
        type: 'card',
        trace: 'account-refund',
        wallet_id: wallet.id
    }).fetch();

    const maxRefund = reloads
        .toJSON()
        .filter(reload => reload.type === 'card' && reload.point.name === 'Internet')
        .map(reload => reload.credit)
        .reduce((a, b) => a + b, 0);

    const refundable = Math.min(maxRefund, wallet.credit);

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
        refundable: refundable,
        minimum: ctx.event.minimumAccountRefund
    };
};
