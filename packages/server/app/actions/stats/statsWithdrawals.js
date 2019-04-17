const statsToCSV = require('server/app/helpers/statsToCSV');
const dateQuery = require('server/app/utils/statsDateQuery');

const relatedCsv = ['seller', 'buyer', 'point'];

module.exports = async (ctx, { dateIn, dateOut, point, csv }) => {
    let query = dateQuery(ctx.models.Withdrawal, dateIn, dateOut);

    if (point) {
        query = query.where({ point_id: point });
    }

    if (csv) {
        const withdrawals = await query.fetchAll({ withRelated: relatedCsv });

        return statsToCSV.generate(withdrawals.toJSON(), statsToCSV.withdrawalFields);
    }

    const withdrawals = await query
        .query(q =>
            q
                .select('name')
                .count('* as count')
                .groupBy('name')
                .orderBy('name')
        )
        .fetchAll();

    return withdrawals.toJSON();
};
