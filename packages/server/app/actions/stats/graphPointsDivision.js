const dateQuery = require('@/utils/statsDateQuery');
const { bookshelf } = require('@/db');

module.exports = async (ctx, { dateIn, dateOut }) => {
    const purchasesDivision = dateQuery(ctx.models.Purchase, dateIn, dateOut)
        .query(knex => {
            knex.select('points.name');
            knex.select(
                bookshelf.knex.raw(
                    'greatest(sum(case when ?? = false then 1 else -1 end), 0) as count',
                    ['purchases.isCancellation']
                )
            );
            knex.select(
                bookshelf.knex.raw(
                    'greatest(coalesce(sum(case when ?? = false then ?? else -1 * ?? end), 0), 0) as sum',
                    ['purchases.isCancellation', 'prices.amount', 'prices.amount']
                )
            );
            knex.leftJoin('prices', 'prices.id', 'purchases.price_id');
            knex.leftJoin('points', 'points.id', 'purchases.point_id');
            knex.groupBy('points.name');
        })
        .fetchAll();

    const reloadsDivision = dateQuery(ctx.models.Reload, dateIn, dateOut)
        .query(knex => {
            knex.select('points.name');
            knex.select(
                bookshelf.knex.raw(
                    'greatest(sum(case when ?? = false then 1 else -1 end), 0) as count',
                    ['isCancellation']
                )
            );
            knex.select(
                bookshelf.knex.raw(
                    'greatest(sum(case when ?? = false then ?? else -1 * ?? end), 0) as sum',
                    ['isCancellation', 'credit', 'credit']
                )
            );
            knex.leftJoin('points', 'points.id', 'reloads.point_id');
            knex.groupBy('points.name');
        })
        .fetchAll();

    const divisions = await Promise.all([purchasesDivision, reloadsDivision]);
    const jsonDivisions = divisions.map(d => d.toJSON());

    return {
        purchases: jsonDivisions[0],
        reloads: jsonDivisions[1]
    };
};
