const statsToCSV = require('server/app/helpers/statsToCSV');
const { isUUID } = require('server/app/utils/idParser');
const dateQuery = require('server/app/utils/statsDateQuery');

const relatedCsv = ['seller', 'wallet', 'wallet.user', 'point'];

module.exports = async (ctx, { dateIn, dateOut, point, csv }) => {
    let query = dateQuery(ctx.models.Reload, dateIn, dateOut);

    if (point && isUUID(point)) {
        query = query.where({ point_id: point });
    }

    if (csv) {
        const reloads = await query.fetchAll({ withRelated: relatedCsv });

        return statsToCSV.generate(reloads.toJSON(), statsToCSV.reloadFields);
    }

    let credits = await query
        .query(q =>
            q
                .select('type', 'isCancellation')
                .sum('credit as credit')
                .groupBy('type', 'isCancellation')
        )
        .fetchAll();

    return credits.toJSON().map((credit, id) => ({
        ...credit,
        id
    }));
};
