const express = require('express');
const APIError = require('../../errors/APIError');
const rightsDetails = require('../../lib/rightsDetails');
const dbCatch = require('../../lib/dbCatch');
const log = require('../../lib/log')(module);

const router = new express.Router();

router.get('/services/buyer', (req, res, next) => {
    const userRights = rightsDetails(req.user, req.point.id);

    if (!userRights.operator) {
        return next(new APIError(module, 401, 'No operator right'));
    }

    if (!req.query.buyer || !req.query.molType) {
        return next();
    }

    const models = req.app.locals.models;
    const now = new Date();

    return models.MeanOfLogin.where({
        type: req.query.molType,
        data: req.query.buyer,
        blocked: false
    })
        .fetch({
            withRelated: [
                'user',
                'user.memberships',
                'user.purchases',
                'user.purchases.price',
                'user.purchases.price.period',
                {
                    'user.memberships.period': query =>
                        query.where('start', '<=', now).where('end', '>=', now)
                }
            ]
        })
        .then(mol => (mol ? mol.toJSON() : null))
        .then(mol => {
            if (!mol || !mol.user.id) {
                return next(new APIError(module, 404, 'Buyer not found'));
            }

            const buyer = mol.user;

            req.details.buyer = buyer.id;

            buyer.pin = '';
            buyer.password = '';

            log.info(`Get buyer data for ${req.details.buyer}`, req.details);

            res
                .status(200)
                .json({
                    buyer
                })
                .end();

            next();
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
