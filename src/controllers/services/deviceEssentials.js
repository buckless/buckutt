const express = require('express');
const { pick } = require('lodash');
const dbCatch = require('../../lib/dbCatch');
const { embedParser, embedFilter } = require('../../lib/embedParser');
const log = require('../../lib/log')(module);

const router = new express.Router();

router.get('/services/deviceEssentials', (req, res, next) => {
    if (!req.user) {
        return res
            .status(200)
            .json({})
            .end();
    }

    const models = req.app.locals.models;
    const pointId = req.point.id;
    const now = new Date();

    const embedRights = [
        {
            embed: 'user',
            required: true
        },
        {
            embed: 'user.meansOfLogin',
            filters: [['blocked', '=', false]],
            required: true
        },
        {
            embed: 'period',
            filters: [['end', '>', now]],
            required: true
        }
    ];

    const embedMemberships = [
        {
            embed: 'user',
            required: true
        },
        {
            embed: 'user.meansOfLogin',
            filters: [['blocked', '=', false], ['type', '=', 'cardId']],
            required: true
        },
        {
            embed: 'period',
            filters: [['end', '>', now]],
            required: true
        }
    ];

    const embedPrices = [
        {
            embed: 'period',
            filters: [['end', '>', now]],
            required: true
        }
    ];

    const embedPendingCardUpdates = [
        {
            embed: 'user',
            required: true
        },
        {
            embed: 'user.meansOfLogin',
            filters: [['blocked', '=', false], ['type', '=', 'cardId']],
            required: true
        }
    ];

    const embedRightsFilters = embedRights.filter(rel => rel.required).map(rel => rel.embed);
    const embedMembershipsFilters = embedMemberships
        .filter(rel => rel.required)
        .map(rel => rel.embed);

    const embedPricesFilters = embedPrices.filter(rel => rel.required).map(rel => rel.embed);
    const embedPendingCardUpdatesFilters = embedPendingCardUpdates
        .filter(rel => rel.required)
        .map(rel => rel.embed);

    const operators = [];
    const giftReloads = [];
    const userTickets = [];
    const accesses = [];
    const groups = [];
    const meansOfPayment = [];
    const nfcCosts = [];
    const pendingCardUpdates = [];
    let device = {};

    // Step 1: get operators
    models.Right.where({
        point_id: pointId
    })
        .fetchAll({
            withRelated: embedParser(embedRights)
        })
        .then(rights => embedFilter(embedRightsFilters, rights.toJSON()))
        .then(rights => {
            rights.filter(right => right.name !== 'admin').forEach(right => {
                const foundOperatorId = operators.findIndex(
                    operator => operator.id === right.user.id
                );
                const formattedRight = {
                    name: right.name,
                    start: right.period.start,
                    end: right.period.end
                };

                if (foundOperatorId === -1) {
                    const newOperator = {
                        id: right.user.id,
                        firstname: right.user.firstname,
                        lastname: right.user.lastname,
                        nickname: right.user.nickname,
                        pin: right.user.pin,
                        rights: [formattedRight],
                        meansOfLogin: right.user.meansOfLogin.map(mol => ({
                            type: mol.type,
                            data: mol.data
                        }))
                    };

                    operators.push(newOperator);
                } else {
                    const newOperator = operators[foundOperatorId];
                    newOperator.rights.push(formattedRight);
                    operators[foundOperatorId] = newOperator;
                }
            });

            // Step 2: fetch giftReloads
            return models.GiftReload.fetchAll().then(giftReloads_ => giftReloads_.toJSON());
        })
        .then(giftReloads_ => {
            for (let i = giftReloads_.length - 1; i >= 0; i -= 1) {
                giftReloads.push(pick(giftReloads_[i], ['everyAmount', 'amount']));
            }

            // Step 3: fetch tickets
            return models.MeanOfLogin.where({
                type: 'ticketId',
                blocked: false
            })
                .fetchAll({
                    withRelated: [
                        'user',
                        { 'user.meansOfLogin': query => query.where({ type: 'username' }) }
                    ]
                })
                .then(meansOfLogin =>
                    meansOfLogin.toJSON().filter(meanOfLogin => meanOfLogin.user.id)
                );
        })
        .then(meansOfLogin => {
            for (let i = meansOfLogin.length - 1; i >= 0; i -= 1) {
                userTickets.push({
                    id: meansOfLogin[i].user.id,
                    fullname: `${meansOfLogin[i].user.firstname} ${meansOfLogin[i].user.lastname}`,
                    username: (meansOfLogin[i].user.meansOfLogin[0] || { data: '' }).data,
                    ticket: meansOfLogin[i].data,
                    credit: meansOfLogin[i].user.credit,
                    hasPaidCard: meansOfLogin[i].user.hasPaidCard
                });
            }

            // Step 4: fetch accesses
            return models.Membership.where('group_id', '!=', req.event.defaultGroup_id)
                .fetchAll({
                    withRelated: embedParser(embedMemberships)
                })
                .then(memberships => embedFilter(embedMembershipsFilters, memberships.toJSON()));
        })
        .then(memberships => {
            for (let i = memberships.length - 1; i >= 0; i -= 1) {
                if (memberships[i].user.meansOfLogin.length > 0) {
                    accesses.push({
                        cardId: memberships[i].user.meansOfLogin[0].data,
                        groupId: memberships[i].group_id,
                        start: memberships[i].period.start,
                        end: memberships[i].period.end
                    });
                }
            }

            // Step 5: fetch groups
            return models.Group.fetchAll().then(groups_ => groups_.toJSON());
        })
        .then(groups_ => {
            for (let i = groups_.length - 1; i >= 0; i -= 1) {
                groups.push(pick(groups_[i], ['id', 'name']));
            }

            // Step 6: fetch meansOfPayment
            return models.MeanOfPayment.fetchAll().then(meansOfPayment_ =>
                meansOfPayment_.toJSON()
            );
        })
        .then(meansOfPayment_ => {
            for (let i = meansOfPayment_.length - 1; i >= 0; i -= 1) {
                meansOfPayment.push(pick(meansOfPayment_[i], ['name', 'slug']));
            }

            // Step 7: fetch nfcCosts
            return models.Price.where({ article_id: req.event.nfc_id })
                .fetchAll({
                    withRelated: embedParser(embedPrices)
                })
                .then(prices => embedFilter(embedPricesFilters, prices.toJSON()));
        })
        .then(prices => {
            for (let i = prices.length - 1; i >= 0; i -= 1) {
                nfcCosts.push({
                    ...pick(prices[i], ['id', 'amount', 'group_id']),
                    period: pick(prices[i].period, ['start', 'end'])
                });
            }

            // Step 8: get pendingCardUpdates
            return models.PendingCardUpdate.fetchAll({
                withRelated: embedParser(embedPendingCardUpdates)
            }).then(pendingCardUpdates_ =>
                embedFilter(embedPendingCardUpdatesFilters, pendingCardUpdates_.toJSON())
            );
        })
        .then(pendingCardUpdates_ => {
            let pendingId;
            for (let i = pendingCardUpdates_.length - 1; i >= 0; i -= 1) {
                pendingId = pendingCardUpdates_[i].user.meansOfLogin[0].data;
                if (pendingCardUpdates.indexOf(pendingId) === -1) {
                    pendingCardUpdates.push(pendingId);
                }
            }

            // Step 9: prepare device
            device = req.device;
            delete device.wikets;

            return Promise.resolve();
        })
        .then(() => {
            log.info('Get deviceEssentials', req.details);

            res
                .status(200)
                .json({
                    operators,
                    giftReloads,
                    userTickets,
                    accesses,
                    groups,
                    meansOfPayment,
                    nfcCosts,
                    pendingCardUpdates,
                    device,
                    event: req.event
                })
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
