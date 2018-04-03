const express                      = require('express');
const { pick }                     = require('lodash');
const dbCatch                      = require('../../lib/dbCatch');
const { embedParser, embedFilter } = require('../../lib/embedParser');

const router = new express.Router();

router.get('/services/deviceEssentials', (req, res, next) => {
    const models  = req.app.locals.models;
    const pointId = req.point.id;
    const now     = new Date();

    const embedRights = [
        {
            embed   : 'user',
            required: true
        },
        {
            embed   : 'user.meansOfLogin',
            filters : [['blocked', '=', false]],
            required: true
        },
        {
            embed   : 'period',
            filters : [['end', '>', now]],
            required: true
        }
    ];

    const embedMemberships = [
        {
            embed   : 'user',
            required: true
        },
        {
            embed   : 'user.meansOfLogin',
            filters : [['blocked', '=', false], ['type', '=', 'cardId']],
            required: true
        },
        {
            embed   : 'period',
            filters : [['end', '>', now]],
            required: true
        }
    ];

    const embedRightsFilters      = embedRights.filter(rel => rel.required).map(rel => rel.embed);
    const embedMembershipsFilters = embedMemberships.filter(rel => rel.required).map(rel => rel.embed);

    const operators   = [];
    const giftReloads = [];
    const userTickets = [];
    const accesses    = [];

    // Step 1: get operators
    models.Right
        .where({
            point_id: pointId
        })
        .fetchAll({
            withRelated: embedParser(embedRights)
        })
        .then(rights => embedFilter(embedRightsFilters, rights.toJSON()))
        .then((rights) => {
            rights
                .filter(right => right.name !== 'admin')
                .forEach((right) => {
                    const foundOperatorId = operators.findIndex(operator => operator.id === right.user.id);
                    const formattedRight  = {
                        name : right.name,
                        start: right.period.start,
                        end  : right.period.end
                    };

                    if (foundOperatorId === -1) {
                        const newOperator  = {
                            id          : right.user.id,
                            firstname   : right.user.firstname,
                            lastname    : right.user.lastname,
                            nickname    : right.user.nickname,
                            pin         : right.user.pin,
                            rights      : [formattedRight],
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
            return models.GiftReload
                .fetchAll()
                .then(giftReloads => giftReloads.toJSON());
        })
        .then((giftReloads_) => {
            for (let i = giftReloads_.length - 1; i >= 0; i -= 1) {
                giftReloads.push(pick(giftReloads_[i], ['everyAmount', 'amount']));
            }

            // Step 3: fetch tickets
            return models.MeanOfLogin
                .where({
                    type   : 'ticketId',
                    blocked: false
                })
                .fetchAll({
                    withRelated: 'user'
                })
                .then(meansOfLogin => meansOfLogin
                    .toJSON()
                    .filter(meanOfLogin => meanOfLogin.user.id)
                );
        })
        .then((meansOfLogin) => {
            for (let i = meansOfLogin.length - 1; i >= 0; i -= 1) {
                userTickets.push({
                    id      : meansOfLogin[i].user.id,
                    fullname: `${meansOfLogin[i].user.firstname} ${meansOfLogin[i].user.lastname}`,
                    ticket  : meansOfLogin[i].data,
                    credit  : meansOfLogin[i].user.credit
                });
            }

            // Step 4: fetch accesses
            return models.Membership
                .where('group_id', '!=', req.event.defaultGroup_id)
                .fetchAll({
                    withRelated: embedParser(embedMemberships)
                })
                .then(memberships => embedFilter(embedMembershipsFilters, memberships.toJSON()));
        })
        .then((memberships) => {
            for (let i = memberships.length - 1; i >= 0; i -= 1) {
                accesses.push({
                    cardId : memberships[i].user.meansOfLogin[0].data,
                    groupId: memberships[i].group_id,
                    start  : memberships[i].period.start,
                    end    : memberships[i].period.end
                });
            }

            return Promise.resolve();
        })
        .then(() => res
            .status(200)
            .json({
                operators,
                giftReloads,
                userTickets,
                accesses
            })
            .end()
        )
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
