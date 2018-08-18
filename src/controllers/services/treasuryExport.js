const express = require('express');
const APIError = require('../../errors/APIError');
const { isUUID } = require('../../lib/idParser');
const dbCatch = require('../../lib/dbCatch');
const log = require('../../lib/log')(module);

const router = new express.Router();

router.get('/services/treasury/csv/purchases', (req, res, next) => {
    const models = req.app.locals.models;

    let initialQuery = models.Purchase.query('orderBy', 'clientTime', 'DESC');
    let price = 'price';

    if (req.query.dateIn && req.query.dateOut) {
        const dateIn = new Date(req.query.dateIn);
        const dateOut = new Date(req.query.dateOut);

        if (!Number.isNaN(dateIn.getTime()) && !Number.isNaN(dateOut.getTime())) {
            initialQuery = initialQuery
                .where('clientTime', '>=', dateIn)
                .where('clientTime', '<=', dateOut);
        } else {
            return next(new APIError(module, 400, 'Invalid dates'));
        }
    }

    let logString = 'Export purchases';

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
            withRelated: [
                price,
                'price.period',
                'price.article',
                'price.promotion',
                'seller',
                'buyer',
                'point'
            ],
            withDeleted: true
        })
        .then(results => {
            // Remove deleted purchases, transform price relation to an outer join
            const purchases = results
                .toJSON()
                .filter(p => !p.deleted_at && p.price.id && p.price.period && p.price.period.id);

            const header = [
                'Date',
                'Point de vente',
                'Vendeur',
                'Acheteur',
                'Article',
                'Prix HT',
                'Prix TTC'
            ];

            const csv = purchases
                .map(purchase => {
                    const item = purchase.price.article
                        ? purchase.price.article
                        : purchase.price.promotion;

                    return [
                        purchase.clientTime.toISOString(),
                        purchase.point.name,
                        `${purchase.seller.firstname} ${purchase.seller.lastname}`,
                        `${purchase.buyer.firstname} ${purchase.buyer.lastname}`,
                        item.name,
                        purchase.price.amount / 100
                    ].join(',');
                })
                .join('\n');

            log.info(logString, req.details);

            return res
                .status(200)
                .send(`${header.join(',')}\n${csv}`)
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

router.get('/services/treasury/csv/withdrawals', (req, res, next) => {
    const models = req.app.locals.models;

    let initialQuery = models.Withdrawal;

    if (req.query.dateIn && req.query.dateOut) {
        const dateIn = new Date(req.query.dateIn);
        const dateOut = new Date(req.query.dateOut);

        if (!Number.isNaN(dateIn.getTime()) && !Number.isNaN(dateOut.getTime())) {
            initialQuery = initialQuery
                .where('clientTime', '>=', dateIn)
                .where('clientTime', '<=', dateOut);
        } else {
            return next(new APIError(module, 400, 'Invalid dates'));
        }
    }

    if (req.query.point) {
        initialQuery = initialQuery.where({ point_id: req.query.point });
    }

    initialQuery
        .fetchAll({
            withRelated: ['seller', 'buyer', 'point']
        })
        .then(results => {
            const withdrawals = results.toJSON();

            const header = ['Date', 'Point de vente', 'Vendeur', 'Acheteur', 'Article'];

            const csv = withdrawals
                .map(withdrawal =>
                    [
                        withdrawal.clientTime.toISOString(),
                        withdrawal.point.name,
                        `${withdrawal.seller.firstname} ${withdrawal.seller.lastname}`,
                        `${withdrawal.buyer.firstname} ${withdrawal.buyer.lastname}`,
                        withdrawal.name
                    ].join(',')
                )
                .join('\n');

            return res
                .status(200)
                .send(`${header.join(',')}\n${csv}`)
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

router.get('/services/treasury/csv/reloads', (req, res, next) => {
    const models = req.app.locals.models;

    let initialQuery = models.Reload.query('orderBy', 'clientTime', 'DESC');

    let logString = 'Export reloads';

    if (req.query.point) {
        req.details.queryPoint = req.query.point;
        logString += ' on point ' + req.query.point;

        if (isUUID(req.query.point)) {
            initialQuery = initialQuery.where({ point_id: req.query.point });
        }
    }

    if (req.query.dateIn && req.query.dateOut) {
        const dateIn = new Date(req.query.dateIn);
        const dateOut = new Date(req.query.dateOut);

        if (!Number.isNaN(dateIn.getTime()) && !Number.isNaN(dateOut.getTime())) {
            initialQuery = initialQuery
                .where('clientTime', '>=', dateIn)
                .where('clientTime', '<=', dateOut);
        } else {
            return next(new APIError(module, 400, 'Invalid dates'));
        }
    }

    initialQuery
        .fetchAll({
            withRelated: ['seller', 'buyer', 'point']
        })
        .then(reloads => {
            const header = [
                'Date',
                'Point de vente',
                'Vendeur',
                'Acheteur',
                'Moyen de paiement',
                'Montant'
            ];

            const csv = reloads
                .toJSON()
                .map(reload =>
                    [
                        reload.clientTime.toISOString(),
                        reload.point.name,
                        `${reload.seller.firstname} ${reload.seller.lastname}`,
                        `${reload.buyer.firstname} ${reload.buyer.lastname}`,
                        reload.type,
                        reload.credit / 100
                    ].join(',')
                )
                .join('\n');

            log.info(logString, req.details);

            res
                .status(200)
                .send(`${header.join(',')}\n${csv}`)
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

router.get('/services/treasury/csv/refunds', (req, res, next) => {
    const models = req.app.locals.models;

    let initialQuery = models.Refund.query('orderBy', 'clientTime', 'DESC');

    if (req.query.dateIn && req.query.dateOut) {
        const dateIn = new Date(req.query.dateIn);
        const dateOut = new Date(req.query.dateOut);

        if (!Number.isNaN(dateIn.getTime()) && !Number.isNaN(dateOut.getTime())) {
            initialQuery = initialQuery
                .where('clientTime', '>=', dateIn)
                .where('clientTime', '<=', dateOut);
        } else {
            return next(new APIError(module, 400, 'Invalid dates'));
        }
    }

    initialQuery
        .fetchAll({
            withRelated: ['seller', 'buyer']
        })
        .then(refunds => {
            const header = ['Date', 'Vendeur', 'Acheteur', 'Moyen de paiement', 'Montant'];

            const csv = refunds
                .toJSON()
                .map(refund =>
                    [
                        refund.clientTime.toISOString(),
                        `${refund.seller.firstname} ${refund.seller.lastname}`,
                        `${refund.buyer.firstname} ${refund.buyer.lastname}`,
                        refund.type,
                        refund.amount / 100
                    ].join(',')
                )
                .join('\n');

            log.info('Export refunds', req.details);

            res
                .status(200)
                .send(`${header.join(',')}\n${csv}`)
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
