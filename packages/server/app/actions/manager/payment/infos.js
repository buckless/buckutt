const { pick } = require('lodash');

module.exports = async (ctx, { wallet }) => {
    const date = new Date();

    const start = ctx.event.accountRefundStart;
    const end = ctx.event.accountRefundEnd;

    const alreadyAsked = await ctx.models.Refund.where({
        type: 'card',
        trace: 'account-refund',
        wallet_id: wallet.id
    }).fetch();

    const cardToken = await ctx.models.Transaction.query(knex => {
        knex.where('wallet_id', wallet.id);
        knex.whereNotNull('cardToken');
        knex.whereNotNull('cardExpiration');
    }).fetch();

    const refundable = wallet.credit;

    const allowed =
        date >= start &&
        date <= end &&
        ctx.event.minimumAccountRefund >= 0 &&
        refundable >= ctx.event.minimumAccountRefund &&
        !alreadyAsked;

    let giftReloads = await ctx.models.GiftReload.fetchAll().then(giftReloads =>
        giftReloads ? giftReloads.toJSON() : null
    );

    giftReloads = giftReloads.map(gr => ({ everyAmount: gr.everyAmount, amount: gr.amount }));

    const reloads = {
        start: ctx.event.accountReloadStart,
        end: ctx.event.accountReloadEnd
    };

    return {
        refunds: {
            allowed,
            start,
            end,
            alreadyAsked,
            refundable,
            cardRegistered: !!cardToken,
            minimum: ctx.event.minimumAccountRefund
        },
        paymentCosts: pick(ctx.event, [
            'fixedCostsReload',
            'variableCostsReload',
            'fixedCostsRefund',
            'variableCostsRefund'
        ]),
        giftReloads,
        reloads
    };
};
