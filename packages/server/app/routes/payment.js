const asyncHandler = require('express-async-handler');
const log = require('server/app/log')(module);
const ctx = require('server/app/utils/ctx');
const APIError = require('server/app/utils/APIError');

const { basket, cancelTransaction, catering } = require('server/app/actions/payment');

const router = require('express').Router();

router.post(
    '/basket',
    asyncHandler(async (req, res) => {
        if (!req.body.walletId || !Array.isArray(req.body.basket)) {
            throw new APIError(module, 400, 'Invalid basket');
        }

        req.details.walletId = req.body.walletId;
        req.details.isCancellation = req.body.isCancellation;
        req.details.basket = req.body.basket;
        req.details.clientTime = req.body.clientTime;

        if (req.body.basket.length === 0) {
            log.info(`processing empty basket`, req.details);

            return res.json({});
        }

        const { walletId, basket: basketToSend, clientTime, isCancellation } = req.body;

        const { updatedWallet } = await basket(ctx(req), {
            walletId,
            basket: basketToSend,
            clientTime,
            isCancellation
        });

        log.info(`processing basket of ${updatedWallet.id} sold by ${req.user.id}`, req.details);

        return res
            .status(200)
            .json(updatedWallet)
            .end();
    })
);

router.post(
    '/cancelTransaction',
    asyncHandler(async (req, res) => {
        req.details.rawType = req.body.rawType;
        req.details.objectId = req.body.id;
        req.details.clientTime = req.body.clientTime;

        const { id, rawType, clientTime } = req.body;

        log.info(`canceling ${rawType} ${id}`, req.details);

        await cancelTransaction(ctx(req), { id, rawType, clientTime });

        res.json({});
    })
);

router.post(
    '/catering',
    asyncHandler(async (req, res) => {
        if (!req.body.walletId || !Number.isInteger(req.body.cateringId) || !req.body.name) {
            throw new APIError(module, 400, 'Invalid catering');
        }

        req.details.walletId = req.body.walletId;

        const { name, cateringId, clientTime, walletId } = req.body;

        log.info(`processing catering`, req.details);

        await catering(ctx(req), { walletId, name, cateringId, clientTime });

        res.json({});
    })
);

module.exports = router;
