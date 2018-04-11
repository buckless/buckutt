const express = require('express');
const logger = require('../../../lib/log');
const dbCatch = require('../../../lib/dbCatch');
const APIError = require('../../../errors/APIError');

const log = logger(module);

/**
 * Reload controller. Handles online reload
 */
const router = new express.Router();

// Get the reciever user
router.post('/services/manager/reload', (req, res, next) => {
    log.info(`Reload ${req.user.id} ${req.body.amount}`);

    if (!req.body.amount || !parseInt(req.body.amount, 10)) {
        return next(new APIError(module, 400, 'Invalid amount', { receiver: req.reciever_id }));
    }

    const amount = parseInt(req.body.amount, 10);

    if (
        req.event.maxPerAccount &&
        req.user.credit + amount > req.event.maxPerAccount
    ) {
        const max = (req.event.maxPerAccount / 100).toFixed(2);
        return next(new APIError(module, 400, `Maximum exceeded : ${max}€`, { user: req.user.id }));
    }


    if (req.event.minReload && amount < req.event.minReload) {
        const min = (req.event.minReload / 100).toFixed(2);
        return next(new APIError(module, 400, `Can not reload less than : ${min}€`));
    }

    req.app.locals
        .makePayment({
            buyer: req.user,
            amount,
            // Used by test reloadProvider
            point: req.point_id
        })
        .then(result => {
            res
                .status(200)
                .json(result)
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

router.get('/services/manager/giftReloads', (req, res, next) => {
    req.app.locals.models.GiftReload.fetchAll()
        .then(giftReloads => (giftReloads ? giftReloads.toJSON() : null))
        .then(giftReloads =>
            res
                .status(200)
                .json(giftReloads.map(gr => ({ everyAmount: gr.everyAmount, amount: gr.amount })))
                .end()
        )
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
