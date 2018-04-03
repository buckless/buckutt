const express                      = require('express');
const { bookshelf }                = require('../../lib/bookshelf');
const dbCatch                      = require('../../lib/dbCatch');
const { embedParser, embedFilter } = require('../../lib/embedParser');
const APIError                     = require('../../errors/APIError');

/**
 * Assigner controller. Handles cards assignment
 */
const router = new express.Router();

router.get('/services/controller', (req, res, next) => {
    if (!req.query.user) {
        return next(new APIError(module, 400, 'Invalid user'));
    }

    const now = new Date();

    const embedMemberships = [
        {
            embed   : 'user',
            required: true
        },
        {
            embed   : 'user.meansOfLogin',
            filters : [['blocked', '=', false], ['type', '=', 'cardId'], ['data', '=', req.query.user]],
            required: true
        },
        {
            embed   : 'period',
            filters : [['end', '>', now]],
            required: true
        }
    ];

    const embedMembershipsFilters = embedMemberships.filter(rel => rel.required).map(rel => rel.embed);

    req.app.locals.models.Membership
        .where('group_id', '!=', req.event.defaultGroup_id)
        .fetchAll({
            withRelated: embedParser(embedMemberships)
        })
        .then(memberships => embedFilter(embedMembershipsFilters, memberships.toJSON()))
        .then((memberships) => {
            const accesses = [];

            for (let i = memberships.length - 1; i >= 0; i -= 1) {
                accesses.push({
                    cardId : memberships[i].user.meansOfLogin[0].data,
                    groupId: memberships[i].group_id,
                    start  : memberships[i].period.start,
                    end    : memberships[i].period.end
                });
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
