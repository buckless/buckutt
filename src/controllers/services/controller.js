const express  = require('express');
const dbCatch  = require('../../lib/dbCatch');
const APIError = require('../../errors/APIError');
const config   = require('../../../config');

/**
 * Assigner controller. Handles cards assignment
 */
const router = new express.Router();

router.get('/services/controller', (req, res, next) => {
    req.app.locals.models.MeanOfLogin
        .where({
            type: 'cardId',
            blocked: false
        })
        .fetchAll({
            withRelated: [
                'user',
                { 'user.memberships': q => q.where('group_id', '!=', req.event.defaultGroup_id) },
                'user.memberships.period'
            ]
        })
        .then((mols) => mols ? mols.toJSON() : null)
        .then((mols) => {
            if (!mols) {
                return [];
            }

            const rights = [];

            for (let i = mols.length - 1; i >= 0; i--) {
                const groups = [];

                const memberships = mols[i].user.memberships;

                for (let j = memberships.length - 1; j >= 0; j--) {
                    groups.push({
                        groupId: memberships[j].group_id,
                        start  : memberships[j].period.start,
                        end    : memberships[j].period.end
                    });
                }

                if (groups.length === 0) {
                    continue;
                }

                rights.push({
                    cardId: mols[i].data,
                    groups
                });
            }

            return res
                .status(200)
                .json(rights)
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
