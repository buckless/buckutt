const express = require('express');
const { bookshelf } = require('../../lib/bookshelf');
const log = require('../../lib/log')(module);
const dbCatch = require('../../lib/dbCatch');
const APIError = require('../../errors/APIError');

/**
 * Pending Card Update controller. Handle pending card updates
 */
const router = new express.Router();

// Get the buyer
router.get('/services/pendingCardUpdate', (req, res, next) => {
    if (!req.query.buyer && !req.query.molType) {
        return next(new APIError(module, 401, 'Invalid parameters'));
    }

    req.app.locals.models.MeanOfLogin.where({
        type: req.query.molType,
        data: req.query.buyer,
        blocked: false
    })
        .fetch({
            withRelated: ['user']
        })
        .then(mol => (mol ? mol.toJSON() : null))
        .then(mol => {
            if (!mol || !mol.user.id) {
                return next(new APIError(module, 400, 'Invalid buyer'));
            }

            req.buyer = mol.user;
            req.details.buyer = mol.user.id;

            next();
        });
});

router.get('/services/pendingCardUpdate', (req, res, next) => {
    let amount;

    return bookshelf
        .knex('pendingCardUpdates')
        .update({ active: null, deleted_at: new Date() })
        .where({ user_id: req.buyer.id, active: true })
        .returning('amount')
        .then(amounts => (amounts || []).reduce((a, b) => a + b, 0))
        .then(amount_ => {
            amount = amount_;

            return bookshelf
                .knex('users')
                .where({ id: req.buyer.id })
                .update({
                    updated_at: new Date(),
                    credit: bookshelf.knex.raw(`credit + ${amount}`)
                })
                .returning('credit');
        })
        .then(credit => {
            req.app.locals.modelChanges.emit('userCreditUpdate', {
                id: req.buyer.id,
                pending: 0,
                credit
            });

            log.info(`Processing pendingCardUpdate ${req.buyer.id}`, req.details);

            return res
                .status(200)
                .json({ amount })
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
