const statsToCSV = require('@/helpers/statsToCSV');
const { isUUID } = require('@/utils/idParser');
const dateQuery = require('@/utils/statsDateQuery');

const relatedCsv = ['seller', 'buyer', 'point'];

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
                .select('type')
                .sum('credit as credit')
                .groupBy('type')
        )
        .fetchAll({ withRelated: csv ? relatedCsv : [] });

    credits = credits.toJSON();

    return credits;
};
