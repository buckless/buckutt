const express = require('express');
const moment = require('moment');
const APIError = require('../../../errors/APIError');
const dbCatch = require('../../../lib/dbCatch');

require('moment-round');

const router = new express.Router();

const chooseDivider = (start, end) => {
    const diff = moment.duration(moment(end).diff(moment(start))).asHours();
    const intervals = [5, 15, 30, 60];
    let lessThan = 6;
    let intervalIndex = 0;
    console.log(diff);
    while (diff > lessThan) {
        lessThan *= 2;
        intervalIndex += 1;

        if (intervals.length >= intervalIndex) {
            intervals[intervals.length] = intervals[intervals.length - 1] * 2;
        }
    }

    console.log(intervals[intervalIndex]);

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

router.get('/services/stats/purchases', (req, res, next) => {
    const models = req.app.locals.models;

    if (!req.query.filters) {
        return next(new APIError(module, 400, 'Filters are missing'));
    }

    const filters = JSON.parse(req.query.filters);
    let baseQuery = models.Purchase;
    let dateIn;
    let dateOut;

    if (req.query.dateIn && req.query.dateOut) {
        dateIn = new Date(req.query.dateIn);
        dateOut = new Date(req.query.dateOut);

        if (!Number.isNaN(dateIn.getTime()) && !Number.isNaN(dateOut.getTime())) {
            baseQuery = baseQuery
                .where('created_at', '>=', dateIn)
                .where('created_at', '<=', dateOut);
        } else {
            return next(new APIError(module, 400, 'Invalid dates'));
        }
    } else {
        return next(new APIError(module, 400, 'Dates are missing'));
    }

    const divider = chooseDivider(dateIn, dateOut);
    const xAxis = buildXAxis(dateIn, dateOut, divider);
    const filterQueries = [];

    filters.forEach(filter => {
        let filterQuery = baseQuery;
        let price = 'price';
        let pricePeriod = 'price.period';

        if (filter.event) {
            pricePeriod = {
                'price.period': q => q.where({ event_id: filter.event })
            };
        }

        if (filter.point) {
            filterQuery = filterQuery.where({ point_id: filter.point });
        }

        if (filter.fundation) {
            price = {
                price: q => q.where({ fundation_id: filter.fundation })
            };
        }

        if (filter.article) {
            if (typeof price === 'string') {
                price = {
                    price: q => q.where({ article_id: filter.article })
                };
            } else {
                const prevCall = price.price;
                price = {
                    price: q => prevCall(q).andWhere({ article_id: filter.article })
                };
            }
        }

        if (filter.promotion) {
            if (typeof price === 'string') {
                price = {
                    price: q => q.where({ promotion_id: filter.promotion })
                };
            } else {
                const prevCall2 = price.price;
                price = {
                    price: q => prevCall2(q).andWhere({ promotion_id: filter.promotion })
                };
            }
        }

        filterQuery = filterQuery.fetchAll({
            withRelated: ['articles', price, pricePeriod, 'price.article', 'price.promotion'],
            withDeleted: true
        });

        filterQueries.push(filterQuery);
    });

    Promise.all(filterQueries)
        .then(results => {
            const curves = {
                xAxis,
                yAxis: []
            };
            const startBoundary = moment(dateIn).ceil(divider, 'minutes');

            results.forEach(purchases => {
                const filteredPurchases = purchases
                    .toJSON()
                    .filter(
                        p => !p.deleted_at && p.price.id && p.price.period && p.price.period.id
                    );

                const yAxis = Array(xAxis.length)
                    .fill({ count: 0, amount: 0 })
                    .map((_, index) => {
                        const start = moment(startBoundary).add(divider * (index - 1), 'minutes');
                        const end = moment(startBoundary).add(divider * index, 'minutes');

                        const dividedPurchases = filteredPurchases.filter(purchase =>
                            moment(purchase.created_at).isBetween(start, end, null, '[)')
                        );

                        return {
                            count: dividedPurchases.length,
                            amount: dividedPurchases.reduce((a, b) => a.amount + b.amount, 0)
                        };
                    });

                curves.yAxis.push(yAxis);
            });

            res
                .status(200)
                .json(curves)
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
