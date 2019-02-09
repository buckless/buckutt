const statsToCSV = require('@/helpers/statsToCSV');
const dateQuery = require('@/utils/statsDateQuery');

const relatedCsv = ['seller', 'buyer', 'point'];

module.exports = async (ctx, { dateIn, dateOut, point, fundation, csv }) => {
    let query = dateQuery(ctx.models.Purchase, dateIn, dateOut);

    if (point) {
        query = query.where({ 'purchases.point_id': point });
    }

    const price = fundation
        ? { price: q => q.where({ 'prices.fundation_id': fundation }) }
        : { price: q => q };

    if (csv) {
        const results = await query.fetchAll({
            withRelated: [price, 'price.period', 'price.article', 'price.promotion', ...relatedCsv],
            withDeleted: true
        });

        // remove deleted purchases, transform price relation to an outer join
        const purchases = results
            .toJSON()
            .filter(p => !p.deleted_at && p.price.id && p.price.period && p.price.period.id);

        return statsToCSV.generate(purchases, statsToCSV.purchaseFields);
    }

    const results = await query
        .query(knex => {
            knex.select(
                'prices.id as id',
                'articles.name as article_name',
                'promotions.name as promotion_name',
                'prices.amount as amount'
            );
            knex.count('prices.id as count');
            knex.sum('prices.amount as total');
            knex.leftJoin('prices', 'prices.id', 'purchases.price_id');
            knex.leftJoin('articles', 'articles.id', 'prices.article_id');
            knex.leftJoin('promotions', 'promotions.id', 'prices.promotion_id');
            price.price(knex);
            knex.groupBy('prices.id', 'articles.name', 'promotions.name');
        })
        .fetchAll();

    return results
        .toJSON()
        .map(p => ({
            price: p.amount,
            id: p.id,
            totalTI: p.total,
            count: p.count,
            name: p.article_name || p.promotion_name
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
};
