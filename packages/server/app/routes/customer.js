const asyncHandler = require('express-async-handler');
const log = require('server/app/log')(module);
const isUser = require('server/app/helpers/isUser');
const rightsDetails = require('server/app/utils/rightsDetails');
const ctx = require('server/app/utils/ctx');
const APIError = require('server/app/utils/APIError');

const {
    buyer,
    listAccesses,
    logAccess,
    commitPendingCardUpdate
} = require('server/app/actions/customer');

const router = require('express').Router();

router.get(
    '/controller',
    asyncHandler(async (req, res) => {
        isUser.controllerOrAdmin.orThrow(req.user, req.point, req.date);

        if (!req.query.walletId) {
            throw new APIError(module, 400, 'Invalid wallet');
        }

        log.info(`get accesses for wallet ${req.query.walletId}`, req.details);

        const accesses = await listAccesses(ctx(req), req.query.walletId);

        res.json(accesses);
    })
);

router.post(
    '/controller',
    asyncHandler(async (req, res) => {
        isUser.controllerOrAdmin.orThrow(req.user, req.point, req.date);

        const walletId = req.body.walletId.toLowerCase().trim();

        req.details.wallet = walletId;
        req.details.clientTime = req.body.clientTime;
        req.details.point = req.point.id;

        await logAccess(ctx(req), {
            walletId,
            wiketId: req.wiket_id,
            clientTime: req.body.clientTime
        });

        log.info(
            `Create access for ${req.details.walletId} on wiket ${req.body.wiket_id}`,
            req.details
        );

        res.json({});
    })
);

router.get(
    '/buyer',
    asyncHandler(async (req, res) => {
        isUser.operatorOrAdmin.orThrow(req.user, req.point, req.date);

        if (!req.query.walletId) {
            throw new APIError(module, 401, 'Missing wallet id');
        }

        const foundBuyer = await buyer(ctx(req), {
            wallet: req.query.wallet
        });

        res.json({ buyer: foundBuyer });
    })
);

router.post(
    '/pendingCardUpdate',
    asyncHandler(async (req, res) => {
        isUser.operatorOrAdmin.orThrow(req.user, req.point, req.date);

        if (!req.body.id) {
            throw new APIError(module, 400, 'Missing id');
        }

        await commitPendingCardUpdate(ctx(req), req.body.id);

        return res.json({});
    })
);

module.exports = router;
