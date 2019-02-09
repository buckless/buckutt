const dateQuery = require('@/utils/statsDateQuery');

module.exports = async (ctx, { dateIn, dateOut }) => {
    const purchasesDivision = dateQuery(ctx.models.Purchase, dateIn, dateOut)
        .query(knex => {
            knex.select('points.name');
            knex.count();
            knex.sum('prices.amount');
            knex.leftJoin('prices', 'prices.id', 'purchases.price_id');
            knex.leftJoin('points', 'points.id', 'purchases.point_id');
            knex.groupBy('points.name');
        })
        .fetchAll();

    const reloadsDivision = dateQuery(ctx.models.Reload, dateIn, dateOut)
        .query(knex => {
            knex.select('points.name');
            knex.count();
            knex.sum('credit');
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
