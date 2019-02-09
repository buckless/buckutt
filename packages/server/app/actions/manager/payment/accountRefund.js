module.exports = async (ctx, { refundData }) => {
    const refund = new ctx.models.Refund({
        amount: refundData.refundable,
        type: 'card',
        trace: 'account-refund',
        buyer_id: ctx.user.id,
        seller_id: ctx.user.id
    });

    const newCredit = ctx.user.credit + refundData.pendingCredit - refundData.refundable;

    await ctx.models.User.where({ id: ctx.user.id }).save(
        { credit: newCredit },
        { patch: true, require: false }
    );

    await ctx.models.PendingCardUpdate.where({ user_id: ctx.user.id }).destroy();
    await refund.save();

    ctx.pub.publish(
        'userCreditUpdate',
        JSON.stringify({
            id: ctx.user.id,
            credit: newCredit,
            pending: null
        })
    );

    return refund.toJSON();
};
