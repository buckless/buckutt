const asyncHandler = require('express-async-handler');
const { omit } = require('lodash');
const log = require('server/app/log')(module);
const isUser = require('server/app/helpers/isUser');
const ctx = require('server/app/utils/ctx');
const rightsDetails = require('server/app/utils/rightsDetails');
const APIError = require('server/app/utils/APIError');

const { eventEssentials, items, usersData } = require('server/app/actions/polling');

const router = require('express').Router();

router.get(
    '/eventEssentials',
    asyncHandler(async (req, res) => {
        // TODO: operators
        log.info('get eventEssentials', req.details);

        const {
            giftReloads,
            groups,
            meansOfPayment,
            nfcCosts,
            operators,
            coupons
        } = await eventEssentials(ctx(req));

        res.status(200)
            .json({
                giftReloads,
                groups,
                meansOfPayment,
                nfcCosts,
                operators,
                coupons,
                device: omit(req.device, 'wikets'),
                wiket: omit(req.wiket, 'period'),
                event: req.event
            })
            .end();
    })
);

router.get(
    '/items',
    asyncHandler(async (req, res) => {
        isUser.operatorOrAdmin.orThrow(req.user, req.point, req.now);

        const { articles, promotions } = await items(ctx(req));

        log.info(`get point items`, req.details);

        res.json({ articles, promotions });
    })
);

router.get(
    '/usersData',
    asyncHandler(async (req, res) => {
        isUser.operatorOrAdmin.orThrow(req.user, req.point, req.now);

        // TODO: revamp with cardsData, and all tickets table
        const now = new Date();
        const lastUpdate = req.query.lastUpdate ? new Date(req.query.lastUpdate) : new Date(0);

        log.info('get usersData', req.details);

        const { blockedCards, accesses, tickets, pendingCardUpdates } = await usersData(ctx(req), {
            now,
            lastUpdate
        });

        res.status(200)
            .json({
                blockedCards,
                accesses,
                tickets,
                pendingCardUpdates,
                time: now
            })
            .end();
    })
);

module.exports = router;
