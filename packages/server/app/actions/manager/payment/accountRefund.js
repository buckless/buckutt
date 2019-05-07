const creditWallet = require('server/app/helpers/creditWallet');

module.exports = async (ctx, { refundData, wallet }) => {
    const refundCosts =
        (ctx.event.variableCostsRefund / 100) * refundData.refundable + ctx.event.fixedCostsRefund;

    const refund = new ctx.models.Refund({
        amount: refundData.refundable - refundCosts,
        type: 'card',
        trace: 'account-refund',
        wallet_id: wallet.id,
        seller_id: ctx.user.id
    });

    const refundCost = new ctx.models.Refund({
        amount: refundCosts,
        type: 'card',
        trace: 'account-refund-cost',
        wallet_id: wallet.id,
        seller_id: ctx.user.id
    });

    await creditWallet(ctx, wallet.id, -1 * refundData.refundable);
    await refund.save();
    await refundCost.save();

    return refund.toJSON();
};
