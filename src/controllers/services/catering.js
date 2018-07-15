const express = require('express');
const { countBy } = require('lodash');
const APIError = require('../../errors/APIError');
const log = require('../../lib/log')(module);
const { bookshelf } = require('../../lib/bookshelf');
const dbCatch = require('../../lib/dbCatch');
const createUser = require('../../lib/createUser');

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

    const molToCheck = {
        type: req.body.molType,
        data: req.body.buyer,
        blocked: false
    };

    req.app.locals.models.MeanOfLogin.where(molToCheck)
        .fetch({
            withRelated: ['user']
        })
        .then(mol => (mol ? mol.toJSON() : null))
        .then(mol => {
            if (!mol || !mol.user || !mol.user.id) {
                // Don't create a new account if the card was already assigned
                if (!req.event.useCardData) {
                    return Promise.reject(new APIError(module, 400, 'Invalid buyer'));
                }

                return createUser(
                    req.app.locals.models,
                    req.event,
                    req.user,
                    req.point,
                    {},
                    [],
                    [molToCheck],
                    [req.event.defaultGroup_id],
                    false,
                    true
                );
            }

            return Promise.resolve(mol.user);
        })
        .then(user => {
            req.buyer = user;
            req.buyer.pin = '';
            req.buyer.password = '';

            req.details.buyer = req.buyer.id;

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
