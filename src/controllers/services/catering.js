const express = require('express');
const { countBy } = require('lodash');
const APIError = require('../../errors/APIError');
const log = require('../../lib/log')(module);
const { bookshelf } = require('../../lib/bookshelf');
const dbCatch = require('../../lib/dbCatch');

/**
 * Basket controller. Handles purchases and reloads
 */
const router = new express.Router();

// Get the buyer
router.post('/services/catering', (req, res, next) => {
    if (
        !req.body.buyer ||
        !req.body.molType ||
        !Number.isInteger(req.body.cateringId) ||
        !req.body.name
    ) {
        return next(new APIError(module, 400, 'Invalid catering'));
    }

    req.details.buyer = req.body.buyer;

    req.app.locals.models.MeanOfLogin.where({
        type: req.body.molType,
        data: req.body.buyer,
        blocked: false
    })
        .fetch({
            withRelated: ['user']
        })
        .then(mol => (mol ? mol.toJSON() : null))
        .then(mol => {
            if (!mol || !mol.user || !mol.user.id) {
                return next(new APIError(module, 400, 'Invalid buyer'));
            }

            req.buyer = mol.user;
            req.buyer.pin = '';
            req.buyer.password = '';

            next();
        })
        .catch(err => dbCatch(module, err, next));
});

router.post('/services/catering', (req, res, next) => {
    const models = req.app.locals.models;

    req.details.body = req.body;

    new models.Withdrawal({
        seller_id: req.user.id,
        buyer_id: req.buyer.id,
        point_id: req.point_id,
        name: req.body.name,
        cateringId: req.body.cateringId,
        created_at: req.body.created_at || new Date(),
        updated_at: req.body.created_at || new Date()
    })
        .save()
        .then(() => {
            log.info(`Processing catering`, req.details);

            res
                .status(200)
                .json({})
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
