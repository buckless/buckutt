const mailer = require('server/app/mailer');
const config = require('server/app/config');
const creditWallet = require('server/app/helpers/creditWallet');

module.exports = async (ctx, { refundData, wallet }) => {
    const refundCosts =
        (ctx.event.variableCostsRefund / 100) * refundData.refundable + ctx.event.fixedCostsRefund;

    const amount = refundData.refundable - refundCosts;

    const refund = new ctx.models.Refund({
        amount,
        type: 'card',
        trace: 'account-refund',
        wallet_id: wallet.id,
        seller_id: ctx.user.id,
        point_id: ctx.point.id
    });

    const refundCost = new ctx.models.Refund({
        amount: refundCosts,
        type: 'card',
        trace: 'account-refund-cost',
        wallet_id: wallet.id,
        seller_id: ctx.user.id,
        point_id: ctx.point.id
    });

    await creditWallet(ctx, wallet.id, -1 * refundData.refundable);
    await refund.save();
    await refundCost.save();

    await mailer
        .send({
            name: 'refundConfirm',
            data: {
                amount: ((refundData.refundable - refundCosts) / 100).toFixed(2),
                brandname: ctx.event.name
            },
            from: ctx.event.contactMail,
            to: ctx.user.mail,
            subject: `${ctx.event.name} — ${config.refund.subject}`
        })
        .catch(err => {
            const error = new Error('sendMail failed');
            error.stack += `\nCaused by:\n${err.stack}`;

            log.error(error);
        });

    return {
        amount,
        date: new Date()
    };
};
