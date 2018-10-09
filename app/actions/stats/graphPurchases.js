const moment = require('moment');

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

const buildXAxis = (start, end, divider) => {
    const startBoundary = moment(start).ceil(divider, 'minutes');
    const endBoundary = moment(end).ceil(divider, 'minutes');
    const xAxis = [];

    for (let t = moment(startBoundary); t <= endBoundary; t.add(divider, 'minutes')) {
        xAxis.push(t.toISOString());
    }

    return xAxis;
};

module.exports = async (ctx, { dateIn, dateOut, filters }) => {
    let query = ctx.models.Purchase.where('clientTime', '>=', dateIn).where(
        'clientTime',
        '<=',
        dateOut
    );

    const divider = chooseDivider(dateIn, dateOut);
    const xAxis = buildXAxis(dateIn, dateOut, divider);
    const filterQueries = [];

    filters.forEach(filter => {
        let filterQuery = query;
        let price = 'price';
        let pricePeriod = 'price.period';

        if (filter.point) {
            filterQuery = filterQuery.where({ point_id: filter.point });
        }

        if (filter.fundation) {
            price = { price: q => q.where({ fundation_id: filter.fundation }) };
        }

        if (filter.article) {
            if (typeof price === 'string') {
                // article and no fundation
                price = { price: q => q.where({ article_id: filter.article }) };
            } else {
                // article and fundation -> andWhere
                const initialPriceCondition = price.price;
                price = {
                    price: q => initialPriceCondition(q).andWhere({ article_id: filter.article })
                };
            }
        }

        if (filter.promotion) {
            if (typeof price === 'string') {
                price = { price: q => q.where({ promotion_id: filter.promotion }) };
            } else {
                const initialPriceCondition = price.price;
                price = {
                    price: q =>
                        initialPriceCondition(q).andWhere({ promotion_id: filter.promotion })
                };
            }
        }

        filterQuery = filterQuery.fetchAll({
            withRelated: ['articles', price, pricePeriod, 'price.article', 'price.promotion'],
            withDeleted: true
        });

        filterQueries.push(filterQuery);
    });

    const results = await Promise.all(filterQueries);

    const curves = {
        xAxis,
        yAxis: []
    };

    const startBoundary = moment(dateIn).ceil(divider, 'minutes');

    results.forEach(purchases => {
        const filteredPurchases = purchases
            .toJSON()
            .filter(p => !p.deleted_at && p.price.id && p.price.period && p.price.period.id);

        const yAxis = Array(xAxis.length)
            .fill({ count: 0, amount: 0 })
            .map((_, index) => {
                const start = moment(startBoundary).add(divider * (index - 1), 'minutes');
                const end = moment(startBoundary).add(divider * index, 'minutes');

                const dividedPurchases = filteredPurchases.filter(purchase =>
                    moment(purchase.clientTime).isBetween(start, end, null, '[)')
                );

                return {
                    count: dividedPurchases.length,
                    amount: dividedPurchases.reduce((a, b) => a.amount + b.amount, 0)
                };
            });

        curves.yAxis.push(yAxis);
    });

    return curves;
};
