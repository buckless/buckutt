const express = require('express');
const { bookshelf } = require('../../lib/bookshelf');
const log = require('../../lib/log')(module);
const dbCatch = require('../../lib/dbCatch');
const creditUser = require('../../lib/creditUser');
const APIError = require('../../errors/APIError');

/**
 * Pending Card Update controller. Handle pending card updates
 */
const router = new express.Router();

router.post('/services/pendingCardUpdate', async (req, res, next) => {
    const models = req.app.locals.models;

    if (!req.body.id) {
        return next(new APIError(module, 400, 'Missing id'));
    }

    try {
        const pendingCardUpdate = await models.PendingCardUpdate.where({ id: req.body.id })
            .fetch()
            .then(pcu => (pcu ? pcu.toJSON() : null));

        if (!pendingCardUpdate) {
            return next(new APIError(module, 404, 'PendingCardUpdate not found'));
        }

        await models.PendingCardUpdate.where({ id: req.body.id }).destroy();
        await creditUser(req, pendingCardUpdate.user_id, pendingCardUpdate.amount);
    } catch (err) {
        return dbCatch(module, err, next);
    }

    return res
        .status(200)
        .json({})
        .end();
});

module.exports = router;
