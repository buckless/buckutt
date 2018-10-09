const { groupBy } = require('lodash');
const statsToCSV = require('@/helpers/statsToCSV');
const dateQuery = require('@/utils/statsDateQuery');

const relatedCsv = ['seller', 'buyer', 'point'];

module.exports = async (ctx, { dateIn, dateOut, point, csv }) => {
    let query = dateQuery(ctx.models.Withdrawal, dateIn, dateOut);

    if (point) {
        query = query.where({ point_id: point });
    }

    const results = await query.fetchAll({ withRelated: csv ? relatedCsv : [] });
    const withdrawals = results.toJSON();

    if (csv) {
        return statsToCSV.generate(withdrawals, statsToCSV.withdrawalFields);
    }

    const groupedWithdrawals = groupBy(withdrawals, 'cateringId');

    const mappedWithdrawals = Object.values(groupedWithdrawals)
        .map(w => ({
            id: w[0].cateringId,
            name: w[0].name,
            count: w.length
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    return mappedWithdrawals;
};
