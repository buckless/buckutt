const express = require('express');
const leven = require('leven');
const { bookshelf } = require('../../../lib/bookshelf');
const { embedParser, embedFilter } = require('../../../lib/embedParser');
const rightsDetails = require('../../../lib/rightsDetails');
const log = require('../../../lib/log')(module);

/**
 * SearchUser controller.
 */
const router = new express.Router();

router.get('/services/manager/searchuser', (req, res) => {
    log.info(`Search user ${req.query.name}`, req.details);

    const models = req.app.locals.models;
    const name = req.query.name;
    const userRights = rightsDetails(req.user, req.point.id);
    const now = new Date();
    let max = req.query.limit;

    if (!userRights.admin) {
        max = Number.isNaN(parseInt(max, 10)) ? 15 : Math.min(max, 15);
    }

    const embedUsers = [
        {
            embed: 'meansOfLogin',
            filters: [['blocked', '=', false], ['type', '=', 'username']]
        },
        {
            embed: 'memberships'
        },
        {
            embed: 'memberships.period',
            filters: [['start', '<', now], ['end', '>', now]],
            required: true
        }
    ];

    const embedUsersFilters = embedUsers.filter(rel => rel.required).map(rel => rel.embed);

    models.User.query(user => {
        let filter = user
            .where(
                bookshelf.knex.raw("concat(lower(firstname), ' ', lower(lastname))"),
                'like',
                `%${name.toLowerCase()}%`
            )
            .orderByRaw('LOWER(firstname) asc');

        if (max > 0) {
            filter = filter.limit(max);
        }

        return filter;
    })
        .fetchAll({ withRelated: embedParser(embedUsers) })
        .then(users => embedFilter(embedUsersFilters, users.toJSON()))
        .then(users => {
            const cleanedUsers = users
                .map(user => ({
                    id: user.id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    credit: userRights.assign ? user.credit : undefined,
                    currentGroups: userRights.assign
                        ? user.memberships.map(membership => ({ id: membership.group_id }))
                        : undefined,
                    username: (user.meansOfLogin[0] || {}).data
                }))
                .sort((a, b) => {
                    const aName = `${a.firstname} ${a.lastname}`;
                    const bName = `${b.firstname} ${b.lastname}`;

                    return leven(name, bName) - leven(name, aName);
                });

            res
                .status(200)
                .json(cleanedUsers)
                .end();
        });
});

module.exports = router;
