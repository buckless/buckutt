const express = require('express');
const log = require('../../lib/log')(module);
const createUser = require('../../lib/createUser');
const { embedParser, embedFilter } = require('../../lib/embedParser');
const dbCatch = require('../../lib/dbCatch');
const fetchFromAPI = require('../../ticketProviders');
const APIError = require('../../errors/APIError');

/**
 * Assigner controller. Handles cards assignment
 */
const router = new express.Router();

router.post('/services/assigner', (req, res, next) => {
    const ticketOrMail = req.body.ticketOrMail;
    const now = new Date();

    if (!ticketOrMail || ticketOrMail.length === 0) {
        return next(new APIError(module, 400, 'Invalid ticketOrMail'));
    }

    const MeanOfLogin = req.app.locals.models.MeanOfLogin;
    let userData;

    const embedMeanOfLogin = [
        {
            embed: 'user',
            required: true
        },
        {
            embed: 'user.meansOfLogin',
            filters: [['blocked', '=', false], ['type', '=', 'username']]
        },
        {
            embed: 'user.memberships'
        },
        {
            embed: 'user.memberships.period',
            filters: [['start', '<', now], ['end', '>', now]],
            required: true
        }
    ];

    const embedMeanOfLoginFilters = embedMeanOfLogin
        .filter(rel => rel.required)
        .map(rel => rel.embed);

    MeanOfLogin.where('type', 'in', ['ticketId', 'username', 'mail'])
        .where({
            data: ticketOrMail,
            blocked: false
        })
        .fetch({
            withRelated: embedParser(embedMeanOfLogin)
        })
        .then(mol => embedFilter(embedMeanOfLoginFilters, [mol.toJSON()]))
        .then(mols => {
            if (mols.length > 0) {
                const mol = mols[0];
                if (req.user) {
                    log.info(``, req.details);

                    return res
                        .status(200)
                        .json({
                            id: mol.user.id,
                            credit: mol.user.credit,
                            name: `${mol.user.firstname} ${mol.user.lastname}`,
                            currentGroups: mol.user.memberships.map(membership => ({
                                id: membership.group_id
                            })),
                            username: (mol.user.meansOfLogin[0] || {}).data
                        })
                        .end();
                }

                const err = new APIError(
                    module,
                    410,
                    'Ticket already binded',
                    req.body.ticketOrMail
                );

                return Promise.reject(err);
            }

            return fetchFromAPI(ticketOrMail)
                .then(userData_ => {
                    if (!userData_) {
                        const err = new APIError(
                            module,
                            404,
                            "Couldn't find ticket",
                            req.body.ticketOrMail
                        );
                        return Promise.reject(err);
                    }

                    userData = userData_;

                    return MeanOfLogin.where({
                        type: 'ticketId',
                        data: userData.ticketId,
                        blocked: false
                    }).fetchAll();
                })
                .then(mols => {
                    if (mols.length > 0) {
                        return Promise.reject(
                            new APIError(module, 404, 'Already assigned', { userData })
                        );
                    }

                    const newUser = {
                        firstname: userData.firstname,
                        lastname: userData.lastname,
                        mail: userData.mail,
                        credit: 0, // Pass it to reloads to have a custom trace
                        username: userData.username
                    };

                    return createUser(
                        req.app.locals.models,
                        req.event,
                        req.user,
                        req.point,
                        newUser,
                        [
                            {
                                credit: userData.credit || 0,
                                type: 'Préchargement',
                                trace: ticketOrMail
                            }
                        ],
                        [
                            {
                                type: 'ticketId',
                                data: userData.ticketId,
                                blocked: false
                            }
                        ],
                        [req.event.defaultGroup_id],
                        true,
                        // if no user, create PCU, else directly write
                        !!req.user
                    );
                })
                .then(user => {
                    if (req.user) {
                        req.details.credit = user.credit;

                        log.info(`Assign ${user.id} with ${credit} credit`, req.details);

                        return res
                            .status(200)
                            .json({
                                id: user.id,
                                credit: user.credit,
                                name: `${user.firstname} ${user.lastname}`,
                                username: userData.username,
                                currentGroups: [req.event.defaultGroup_id]
                            })
                            .end();
                    }

                    log.info(`Already assigned`, req.details);

                    return res
                        .status(200)
                        .json({})
                        .end();
                });
        })
        .catch(err => dbCatch(module, err, next));
});

router.post('/services/assigner/groups', (req, res, next) => {
    const userId = req.body.user;
    const groups = req.body.groups;

    req.details.userId = userId;
    req.details.groups = groups;

    if (!userId || userId.length === 0) {
        return next(new APIError(module, 400, 'Invalid user'));
    }

    if (!groups || !Array.isArray(groups)) {
        return next(new APIError(module, 400, 'Invalid groups'));
    }

    const Membership = req.app.locals.models.Membership;

    const memberships = groups.map(groupId =>
        new Membership({
            user_id: userId,
            group_id: groupId,
            period_id: req.event.defaultPeriod_id
        }).save()
    );

    Promise.all(memberships)
        .then(() => {
            log.info(`Create ${memberships.length} memberships for user ${userId}`, req.details);

            res
                .status(200)
                .json({})
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

router.post('/services/assigner/anon', (req, res, next) => {
    const credit = req.body.credit;
    const groups = req.body.groups;
    const cardId = req.body.cardId;

    req.details.groups = groups;
    req.details.cardId = cardId;
    req.details.credit = credit;

    if (!cardId || cardId.length === 0) {
        return next(new APIError(module, 400, 'Invalid cardId'));
    }

    if (!Number.isInteger(credit)) {
        return next(new APIError(module, 400, 'Invalid credit'));
    }

    if (!groups || !Array.isArray(groups)) {
        return next(new APIError(module, 400, 'Invalid groups'));
    }

    createUser(
        req.app.locals.models,
        req.event,
        req.user,
        req.point,
        { credit },
        [],
        [
            {
                type: 'cardId',
                data: cardId,
                blocked: false
            }
        ],
        groups.concat([req.event.defaultGroup_id]),
        false,
        true
    )
        .then(user => {
            log.info(
                `Create anon user ${user.id} with ${
                    groups.length
                } memberships and ${credit} credit`,
                req.details
            );

            res
                .status(200)
                .json({})
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
