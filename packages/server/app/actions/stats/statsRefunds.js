const statsToCSV = require('server/app/helpers/statsToCSV');
const { isUUID } = require('server/app/utils/idParser');
const dateQuery = require('server/app/utils/statsDateQuery');

const relatedCsv = ['seller', 'wallet', 'wallet.user', 'point'];

module.exports = async (ctx, { dateIn, dateOut, point, csv }) => {
    let query = dateQuery(ctx.models.Refund, dateIn, dateOut);

    if (point && isUUID(point)) {
        query = query.where({ point_id: point });
    }

    if (csv) {
        const refunds = await query.fetchAll({ withRelated: relatedCsv });

        return statsToCSV.generate(refunds.toJSON(), statsToCSV.refundFields);
    }

    const amounts = await query
        .query(q =>
            q
                .select('type')
                .sum('amount as amount')
                .groupBy('type')
        )
        .fetchAll();

    return amounts.toJSON().map((amount, id) => ({
        ...amount,
        id
    }));
};
