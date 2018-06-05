const express = require('express');
const { groupBy, sumBy } = require('lodash');
const APIError = require('../../errors/APIError');
const { isUUID } = require('../../lib/idParser');
const dbCatch = require('../../lib/dbCatch');
const log = require('../../lib/log')(module);

const router = new express.Router();

router.get('/services/treasury/purchases', (req, res, next) => {
    const models = req.app.locals.models;

    let initialQuery = models.Purchase;
    let price = 'price';

    if (req.query.dateIn && req.query.dateOut) {
        const dateIn = new Date(req.query.dateIn);
        const dateOut = new Date(req.query.dateOut);

        if (!Number.isNaN(dateIn.getTime()) && !Number.isNaN(dateOut.getTime())) {
            initialQuery = initialQuery
                .where('created_at', '>=', dateIn)
                .where('created_at', '<=', dateOut);
        } else {
            return next(new APIError(module, 400, 'Invalid dates'));
        }
    }

    let logString = 'Get purchases';

    if (req.query.point) {
        req.details.queryPoint = req.query.point;
        logString += ' on point ' + req.query.point;

        initialQuery = initialQuery.where({ point_id: req.query.point });
    }

    if (req.query.fundation) {
        req.details.queryFundation = req.query.fundation;
        logString += ' for fundation ' + req.query.fundation;

        price = {
            price: q => q.where({ fundation_id: req.query.fundation })
        };
    }

    initialQuery
        .fetchAll({
            withRelated: [price, 'price.period', 'price.article', 'price.promotion'],
            withDeleted: true
        })
        .then(results => {
            // Remove deleted purchases, transform price relation to an outer join
            const purchases = results
                .toJSON()
                .filter(p => !p.deleted_at && p.price.id && p.price.period && p.price.period.id);

            const groupedPurchases = groupBy(purchases, 'price_id');

            const mappedPurchases = Object.values(groupedPurchases)
                .map(p => ({
                    price: p[0].price.amount,
                    id: p[0].price.id,
                    totalTI: sumBy(p, 'price.amount'),
                    totalVAT: sumBy(p, 'vat'),
                    count: p.length,
                    name: p[0].price.article ? p[0].price.article.name : p[0].price.promotion.name
                }))
                .sort((a, b) => a.name.localeCompare(b.name));

            log.info(logString, req.details);

            res
                .status(200)
                .json(mappedPurchases)
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

router.get('/services/treasury/withdrawals', (req, res, next) => {
    const models = req.app.locals.models;

    let initialQuery = models.Withdrawal;

    if (req.query.dateIn && req.query.dateOut) {
        const dateIn = new Date(req.query.dateIn);
        const dateOut = new Date(req.query.dateOut);

        if (!Number.isNaN(dateIn.getTime()) && !Number.isNaN(dateOut.getTime())) {
            initialQuery = initialQuery
                .where('created_at', '>=', dateIn)
                .where('created_at', '<=', dateOut);
        } else {
            return next(new APIError(module, 400, 'Invalid dates'));
        }
    }

    if (req.query.point) {
        initialQuery = initialQuery.where({ point_id: req.query.point });
    }

    initialQuery
        .fetchAll()
        .then(results => {
            const withdrawals = results.toJSON();
            const groupedWithdrawals = groupBy(withdrawals, 'cateringId');

            const mappedWithdrawals = Object.values(groupedWithdrawals)
                .map(w => ({
                    id: w[0].cateringId,
                    name: w[0].name,
                    count: w.length
                }))
                .sort((a, b) => a.name.localeCompare(b.name));

            res
                .status(200)
                .json(mappedWithdrawals)
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

router.get('/services/treasury/reloads', (req, res, next) => {
    const models = req.app.locals.models;

    let initialQuery = models.Reload;

    let logString = 'Get reloads';

    if (req.query.point) {
        if (isUUID(req.query.point)) {
            req.details.queryPoint = req.query.point;
            logString += ' on point ' + req.query.point;

            initialQuery = initialQuery.where({ point_id: req.query.point });
        }
    }

    if (req.query.dateIn && req.query.dateOut) {
        const dateIn = new Date(req.query.dateIn);
        const dateOut = new Date(req.query.dateOut);

        if (!Number.isNaN(dateIn.getTime()) && !Number.isNaN(dateOut.getTime())) {
            initialQuery = initialQuery
                .where('created_at', '>=', dateIn)
                .where('created_at', '<=', dateOut);
        } else {
            return next(new APIError(module, 400, 'Invalid dates'));
        }
    }

    initialQuery
        .query(q =>
            q
                .select('type')
                .sum('credit as credit')
                .groupBy('type')
        )
        .fetchAll()
        .then(credits => {
            log.info(logString, req.details);

            res
                .status(200)
                .json(credits.toJSON())
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

router.get('/services/treasury/refunds', (req, res, next) => {
    const models = req.app.locals.models;

    let initialQuery = models.Refund;

    if (req.query.dateIn && req.query.dateOut) {
        const dateIn = new Date(req.query.dateIn);
        const dateOut = new Date(req.query.dateOut);

        if (!Number.isNaN(dateIn.getTime()) && !Number.isNaN(dateOut.getTime())) {
            initialQuery = initialQuery
                .where('created_at', '>=', dateIn)
                .where('created_at', '<=', dateOut);
        } else {
            return next(new APIError(module, 400, 'Invalid dates'));
        }
    }

    initialQuery
        .query(q =>
            q
                .select('type')
                .sum('amount as amount')
                .groupBy('type')
        )
        .fetchAll()
        .then(amounts => {
            log.info('Get refunds', req.details);

            res
                .status(200)
                .json(amounts.toJSON())
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
