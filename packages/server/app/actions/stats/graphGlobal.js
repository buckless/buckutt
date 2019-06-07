const { bookshelf } = require('server/app/db');

module.exports = async ctx => {
    const activeCards = ctx.models.Wallet.query(knex => knex.count())
        .where({ blocked: false })
        .whereNotNull('logical_id')
        .fetch();

    const validatedTickets = ctx.models.Ticket.query(knex => knex.count())
        .whereNotNull('validation')
        .fetch();

    const reloads = ctx.models.Reload.query(knex =>
        knex.select(
            bookshelf.knex.raw('sum(case when ?? = false then ?? else -1 * ?? end)', [
                'isCancellation',
                'credit',
                'credit'
            ])
        )
    ).fetch();

    const purchases = ctx.models.Purchase.query(knex => {
        knex.select(
            bookshelf.knex.raw('sum(case when ?? = false then ?? else -1 * ?? end)', [
                'purchases.isCancellation',
                'purchases.amount',
                'purchases.amount'
            ])
        );
    }).fetch();

    const refunds = ctx.models.Refund.query(knex =>
        knex.select(
            bookshelf.knex.raw('sum(case when ?? = false then ?? else -1 * ?? end)', [
                'isCancellation',
                'amount',
                'amount'
            ])
        )
    ).fetch();

    const results = await Promise.all([activeCards, validatedTickets, reloads, purchases, refunds]);
    const jsonResults = results.map(r => parseInt(r.toJSON().count || r.toJSON().sum, 10));

    return {
        activeCards: jsonResults[0],
        validatedTickets: jsonResults[1],
        reloads: jsonResults[2],
        purchases: jsonResults[3],
        refunds: jsonResults[4]
    };
};
