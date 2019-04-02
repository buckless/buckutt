module.exports = async (ctx, { wallet }) => {
    const date = new Date();

    const start = ctx.event.accountRefundStart;
    const end = ctx.event.accountRefundEnd;

    const alreadyAsked = await ctx.models.Refund.where({
        type: 'card',
        trace: 'account-refund',
        wallet_id: wallet.id
    }).fetch();

    const refundable = wallet.credit;

    const allowed =
        date >= start &&
        date <= end &&
        ctx.event.minimumAccountRefund >= 0 &&
        refundable >= ctx.event.minimumAccountRefund &&
        !alreadyAsked;

    return {
        allowed,
        start,
        end,
        alreadyAsked,
        refundable,
        minimum: ctx.event.minimumAccountRefund
    };
};
