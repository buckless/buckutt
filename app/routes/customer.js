const asyncHandler = require('express-async-handler');
const log = require('@/log')(module);
const rightsDetails = require('@/utils/rightsDetails');
const ctx = require('@/utils/ctx');
const APIError = require('@/utils/APIError');

const { buyer, listAccesses, logAccess, commitPendingCardUpdate } = require('@/actions/customer');

const router = require('express').Router();

router.get(
    '/controller',
    asyncHandler(async (req, res) => {
        if (!req.query.user) {
            throw new APIError(module, 400, 'Invalid user');
        }

        log.info(`get accesses for user ${req.user.id}`, req.details);

        const accesses = await listAccesses(req.query.user);

        res.json(accesses);
    })
);

router.post(
    '/controller',
    asyncHandler(async (req, res) => {
        const cardId = req.body.cardId.toLowerCase().trim();

        req.details.mol = cardId;
        req.details.clientTime = req.body.clientTime;
        req.details.point = req.point.id;

        await logAccess(ctx(req), {
            cardId,
            wiketId: req.wiket_id,
            clientTime: req.body.clientTime
        });

        log.info(`Create access for ${req.details.mol} on wiket ${req.body.wiket_id}`, req.details);

        res.json({});
    })
);

router.get(
    '/buyer',
    asyncHandler(async (req, res) => {
        const userRights = rightsDetails(req.user, req.point.id);

        if (!userRights.operator) {
            throw new APIError(module, 401, 'No operator right');
        }

        if (!req.query.buyer || !req.query.molType) {
            throw new APIError(module, 401, 'Missing buyer or molType');
        }

        const foundBuyer = await buyer(ctx(req), {
            type: req.query.molType,
            buyer: req.query.buyer
        });

        res.json({ buyer: foundBuyer });
    })
);

router.post(
    '/pendingCardUpdate',
    asyncHandler(async (req, res) => {
        if (!req.body.id) {
            throw new APIError(module, 400, 'Missing id');
        }

        await commitPendingCardUpdate(ctx(req), req.body.id);

        return res.json({});
    })
);

module.exports = router;
