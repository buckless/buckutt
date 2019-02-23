const moment = require('moment');
const { bookshelf } = require('server/app/db');

require('moment-round');

const chooseDivider = (start, end) => {
    const diff = moment.duration(moment(end).diff(moment(start))).asHours();
    const intervals = [5, 15, 30, 60];
    let lessThan = 6;
    let intervalIndex = 0;
    while (diff > lessThan) {
        lessThan *= 2;
        intervalIndex += 1;

        if (intervals.length >= intervalIndex) {
            intervals[intervals.length] = intervals[intervals.length - 1] * 2;
        }
    }

    return intervals[intervalIndex];
};

const buildXAxis = (startBoundary, endBoundary, divider) => {
    const xAxis = [];

    for (let t = moment(startBoundary); t <= endBoundary; t.add(divider, 'minutes')) {
        xAxis.push(t.toISOString());
    }

    return xAxis;
};

module.exports = async (ctx, { dateIn, dateOut, additive, filters }) => {
    const divider = chooseDivider(dateIn, dateOut);
    const startBoundary = moment(dateIn).ceil(divider, 'minutes');
    const endBoundary = moment(dateOut).ceil(divider, 'minutes');
    const xAxis = buildXAxis(startBoundary, endBoundary, divider);

    const results = filters.map(filter => {
        const purchasesFilters = {};
        const pricesFilters = {};

        if (filter.point) {
            purchasesFilters['purchases.point_id'] = bookshelf.knex.raw('?', filter.point);
        }

        if (filter.fundation) {
            pricesFilters['prices.fundation_id'] = bookshelf.knex.raw('?', filter.fundation);
        }

        if (filter.article) {
            pricesFilters['prices.article_id'] = bookshelf.knex.raw('?', filter.article);
        }

        if (filter.promotion) {
            pricesFilters['prices.promotion_id'] = bookshelf.knex.raw('?', filter.promotion);
        }

        return ctx.models.Purchase.query(knex => {
            knex.select(
                bookshelf.knex.raw(
                    'greatest(sum(case when ?? = false then 1 else -1 end), 0) as count',
                    ['purchases.isCancellation']
                )
            );
            knex.select(
                bookshelf.knex.raw(
                    'greatest(coalesce(sum(case when ?? = false then ?? else -1 * ?? end), 0), 0) as amount',
                    ['purchases.isCancellation', 'prices.amount', 'prices.amount']
                )
            );
            knex.from(
                bookshelf.knex.raw(
                    `generate_series(timestamp '${startBoundary.toISOString()}', timestamp '${endBoundary.toISOString()}', '${divider} minutes') date`
                )
            );
            knex.leftJoin('purchases', qb => {
                if (additive) {
                    qb.on('purchases.clientTime', '<=', bookshelf.knex.raw('date'));
                } else {
                    qb.onBetween('purchases.clientTime', [
                        bookshelf.knex.raw(`(date - interval '${divider} minutes')`),
                        bookshelf.knex.raw('date')
                    ]);
                    qb.onBetween('purchases.clientTime', [dateIn, dateOut]);
                }

                qb.on(purchasesFilters);
                qb.onNull('purchases.deleted_at');
            });
            knex.leftJoin('prices', qb => {
                qb.on('prices.id', 'purchases.price_id');
                qb.on(pricesFilters);
            });
            knex.groupBy('date');
            knex.orderBy('date');
        })
            .fetchAll()
            .then(purchases => purchases.toJSON());
    });

    const curves = {
        xAxis,
        yAxis: await Promise.all(results)
    };

    return curves;
};
