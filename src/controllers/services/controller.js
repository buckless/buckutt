const express  = require('express');
const dbCatch  = require('../../lib/dbCatch');
const APIError = require('../../errors/APIError');
const config   = require('../../../config');

/**
 * Assigner controller. Handles cards assignment
 */
const router = new express.Router();

router.get('/services/controller', (req, res, next) => {
    req.app.locals.models.Membership
        .where('group_id', '!=', req.event.defaultGroup_id)
        .fetchAll({
            withRelated: [
                'period',
                'user',
                { 'user.meansOfLogin': q => q.where({ type: 'cardId', blocked: false }) }
            ]
        })
        .then((memberships) => memberships ? memberships.toJSON() : null)
        .then((memberships) => {
            if (!memberships) {
                return [];
            }

            const accesses = [];

            for (let i = memberships.length - 1; i >= 0; i--) {
                if (!memberships[i].user ||
                    !memberships[i].user.meansOfLogin ||
                    !memberships[i].user.meansOfLogin.length) {
                    continue;
                }

                accesses.push({
                    cardId: memberships[i].user.meansOfLogin[0].data,
                    group : memberships[i].group_id,
                    start : memberships[i].period.start,
                    end   : memberships[i].period.end
                });
            }

            return res
                .status(200)
                .json(accesses)
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
