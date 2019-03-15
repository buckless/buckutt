const creditWallet = require('server/app/helpers/creditWallet');

module.exports = async (ctx, { refundData, wallet }) => {
    const refund = new ctx.models.Refund({
        amount: refundData.refundable,
        type: 'card',
        trace: 'account-refund',
        wallet_id: wallet.id,
        seller_id: ctx.user.id
    });

    await creditWallet(ctx, wallet.id, -1 * refundData.refundable);
    await refund.save();

    return refund.toJSON();
};
