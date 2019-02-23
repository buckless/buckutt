const { bookshelf } = require('server/app/db');

module.exports = async ctx => {
    const activeCards = ctx.models.MeanOfLogin.query(knex => knex.count())
        .where({ type: 'cardId', blocked: false })
        .fetch();

    const validatedTickets = ctx.models.MeanOfLogin.query(knex => knex.count())
        .where({ type: 'ticketId', blocked: true })
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
            bookshelf.knex.raw(
                'coalesce(sum(case when ?? = false then ?? else -1 * ?? end), 0) as sum',
                ['purchases.isCancellation', 'prices.amount', 'prices.amount']
            )
        );
        knex.leftJoin('prices', 'prices.id', 'purchases.price_id');
    }).fetch();

    const results = await Promise.all([activeCards, validatedTickets, reloads, purchases]);
    const jsonResults = results.map(r => parseInt(r.toJSON().count || r.toJSON().sum, 10));

    return {
        activeCards: jsonResults[0],
        validatedTickets: jsonResults[1],
        reloads: jsonResults[2],
        purchases: jsonResults[3]
    };
};
