const express       = require('express');
const { bookshelf } = require('../../lib/bookshelf');
const dbCatch       = require('../../lib/dbCatch');
const APIError      = require('../../errors/APIError');

/**
 * Assigner controller. Handles cards assignment
 */
const router = new express.Router();

router.get('/services/controller', (req, res, next) => {
    const userFilter = {
        'user.meansOfLogin': (req.query.user)
            ? q => q.where({ type: 'cardId', data: req.query.user, blocked: false })
            : q => q.where({ type: 'cardId', blocked: false })
    };

    req.app.locals.models.Membership
        .where('group_id', '!=', req.event.defaultGroup_id)
        .fetchAll({
            withRelated: [
                'period',
                'user',
                userFilter
            ]
        })
        .then(memberships => (memberships ? memberships.toJSON() : null))
        .then((memberships) => {
            if (!memberships) {
                return [];
            }

            const accesses = [];

            for (let i = memberships.length - 1; i >= 0; i -= 1) {
                if (memberships[i].user &&
                    memberships[i].user.meansOfLogin &&
                    memberships[i].user.meansOfLogin.length) {
                    accesses.push({
                        cardId : memberships[i].user.meansOfLogin[0].data,
                        groupId: memberships[i].group_id,
                        start  : memberships[i].period.start,
                        end    : memberships[i].period.end
                    });
                }
            }

            return res
                .status(200)
                .json(accesses)
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

router.post('/services/controller', (req, res, next) => req.app.locals.models.MeanOfLogin
    .query(q => q.where(bookshelf.knex.raw('lower(data)'), '=', req.body.cardId.toLowerCase().trim()))
    .where({
        type   : 'cardId',
        blocked: false
    })
    .fetch()
    .then(mol => ((mol) ? mol.toJSON() : null))
    .then((mol) => {
        if (!mol) {
            const errDetails = {
                mol  : req.body.cardId.toLowerCase().trim(),
                point: req.Point_id
            };

            return next(new APIError(module, 401, 'User not found', errDetails));
        }

        const access = new req.app.locals.models.Access({
            meanOfLogin_id: mol.id,
            operator_id   : req.user.id,
            wiket_id      : req.body.wiket_id,
            created_at    : req.body.created_at || new Date(),
            updated_at    : req.body.created_at || new Date()
        });

        return access.save();
    })
    .then(() => res.status(200).json({}).end())
    .catch(err => dbCatch(module, err, next)));

module.exports = router;
