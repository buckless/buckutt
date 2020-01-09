const { pick } = require('lodash');

module.exports = async ctx => {
    const date = new Date();

    const start = ctx.event.accountRefundStart;
    const end = ctx.event.accountRefundEnd;

    let wallets = await ctx.models.Wallet.where('user_id', ctx.user.id)
        .fetchAll({
            withRelated: ['ticket']
        })
        .then(ws => (ws ? ws.map(w => w.toJSON()) : null));

    const reloads = {
        start: ctx.event.accountReloadStart,
        end: ctx.event.accountReloadEnd
    };

    let giftReloads = await ctx.models.GiftReload.fetchAll().then(giftReloads =>
        giftReloads ? giftReloads.toJSON() : null
    );

    giftReloads = giftReloads.map(gr => pick(gr, ['everyAmount', 'amount', 'minimalAmount']));

    const paymentCosts = pick(ctx.event, [
        'fixedCostsReload',
        'variableCostsReload',
        'fixedCostsRefund',
        'variableCostsRefund'
    ]);

    let meansOfPayment = await ctx.models.MeanOfPayment.fetchAll().then(means =>
        means ? means.toJSON() : null
    );

    meansOfPayment = meansOfPayment.map(mean => pick(mean, ['slug', 'name']));

    wallets = await Promise.all(
        wallets.map(async wallet => {
            let alreadyAsked = await ctx.models.Refund.where({
                type: 'card',
                trace: 'account-refund',
                wallet_id: wallet.id
            }).fetch();

            alreadyAsked = alreadyAsked
                ? {
                      amount: alreadyAsked.get('amount'),
                      date: alreadyAsked.get('clientTime')
                  }
                : null;

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

            return {
                ...wallet,
                refunds: {
                    allowed,
                    start,
                    end,
                    alreadyAsked,
                    refundable,
                    cardRegistered: !!cardToken,
                    minimum: ctx.event.minimumAccountRefund
                }
            };
        })
    );

    return {
        wallets,
        reloads,
        giftReloads,
        paymentCosts,
        meansOfPayment
    };
};
