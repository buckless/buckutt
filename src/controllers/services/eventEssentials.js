const express = require('express');
const { pick } = require('lodash');
const dbCatch = require('../../lib/dbCatch');
const { embedParser, embedFilter } = require('../../lib/embedParser');
const log = require('../../lib/log')(module);

const router = new express.Router();

// Polling every 20 minutes
router.get('/services/eventEssentials', async (req, res, next) => {
    if (!req.user) {
        return res
            .status(200)
            .json({})
            .end();
    }

    const models = req.app.locals.models;
    const now = new Date();

    const giftReloads = [];
    const groups = [];
    const meansOfPayment = [];
    const nfcCosts = [];
    const operators = [];

    try {
        // Step 1: fetch giftReloads
        const giftReloads_ = await models.GiftReload.fetchAll().then(giftReloads_ =>
            giftReloads_.toJSON()
        );

        for (let i = giftReloads_.length - 1; i >= 0; i -= 1) {
            giftReloads.push(pick(giftReloads_[i], ['everyAmount', 'amount']));
        }

        // Step 2: fetch groups
        const groups_ = await models.Group.fetchAll().then(groups_ => groups_.toJSON());

        for (let i = groups_.length - 1; i >= 0; i -= 1) {
            groups.push(pick(groups_[i], ['id', 'name']));
        }

        // Step 3: fetch meansOfPayment
        const meansOfPayment_ = await models.MeanOfPayment.fetchAll().then(meansOfPayment_ =>
            meansOfPayment_.toJSON()
        );

        for (let i = meansOfPayment_.length - 1; i >= 0; i -= 1) {
            meansOfPayment.push(pick(meansOfPayment_[i], ['name', 'slug']));
        }

        // Step 4: fetch nfcCosts
        const embedPrices = [
            {
                embed: 'period',
                filters: [['end', '>', now]],
                required: true
            }
        ];

        const embedPricesFilters = embedPrices.filter(rel => rel.required).map(rel => rel.embed);

        const prices = await models.Price.where({ article_id: req.event.nfc_id })
            .fetchAll({
                withRelated: embedParser(embedPrices)
            })
            .then(prices => embedFilter(embedPricesFilters, prices.toJSON()));

        for (let i = prices.length - 1; i >= 0; i -= 1) {
            nfcCosts.push({
                ...pick(prices[i], ['id', 'amount', 'group_id']),
                ...pick(prices[i].period, ['start', 'end']),
                group: prices[i].group_id
            });
        }

        // Step 5: fetch operators
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

        const embedRightsFilters = embedRights.filter(rel => rel.required).map(rel => rel.embed);

        const rights = await models.Right.where({ point_id: req.point.id })
            .where('name', '!=', 'admin')
            .fetchAll({
                withRelated: embedParser(embedRights)
            })
            .then(rights => embedFilter(embedRightsFilters, rights.toJSON()));

        rights.forEach(right => {
            const foundOperatorId = operators.findIndex(operator => operator.id === right.user.id);
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
    } catch (err) {
        return dbCatch(module, err, next);
    }

    // Step 5: prepare device
    device = req.device;
    delete device.wikets;

    log.info('Get eventEssentials', req.details);

    res
        .status(200)
        .json({
            giftReloads,
            groups,
            meansOfPayment,
            nfcCosts,
            operators,
            device,
            event: req.event
        })
        .end();
});

module.exports = router;
