const { groupBy, sumBy } = require('lodash');
const statsToCSV = require('@/helpers/statsToCSV');
const dateQuery = require('@/utils/statsDateQuery');

const relatedCsv = ['seller', 'buyer', 'point'];

module.exports = async (ctx, { dateIn, dateOut, point, fundation, csv }) => {
    let price = 'price';

    let query = dateQuery(ctx.models.Purchase, dateIn, dateOut);

    if (point) {
        query = query.where({ point_id: point });
    }

    if (fundation) {
        price = { price: q => q.where({ fundation_id: fundation }) };
    }

    const results = await query.fetchAll({
        withRelated: [
            price,
            'price.period',
            'price.article',
            'price.promotion',
            // append related fields needed for csv generation
            ...(csv ? relatedCsv : [])
        ],
        withDeleted: true
    });

    // remove deleted purchases, transform price relation to an outer join
    const purchases = results
        .toJSON()
        .filter(p => !p.deleted_at && p.price.id && p.price.period && p.price.period.id);

    if (csv) {
        return statsToCSV.generate(purchases, statsToCSV.purchasesFields);
    }

    const groupedPurchases = groupBy(purchases, 'price_id');

    return Object.values(groupedPurchases)
        .map(p => ({
            price: p[0].price.amount,
            id: p[0].price.id,
            totalTI: sumBy(p, 'price.amount'),
            count: p.length,
            name: p[0].price.article ? p[0].price.article.name : p[0].price.promotion.name
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
};
