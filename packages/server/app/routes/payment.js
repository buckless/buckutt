const asyncHandler = require('express-async-handler');
const log = require('@/log')(module);
const ctx = require('@/utils/ctx');
const APIError = require('@/utils/APIError');

const { basket, cancelTransaction, catering } = require('@/actions/payment');

const router = require('express').Router();

router.post(
    '/basket',
    asyncHandler(async (req, res) => {
        if (!req.body.buyer || !req.body.molType || !Array.isArray(req.body.basket)) {
            throw new APIError(module, 400, 'Invalid basket');
        }

        req.details.buyer = req.body.buyer;
        req.details.isCancellation = req.body.isCancellation;
        req.details.basket = req.body.basket;
        req.details.clientTime = req.body.clientTime;

        if (req.body.basket.length === 0) {
            log.info(`processing empty basket`, req.details);

            return res.json({});
        }

        const { buyer, molType, basket: basketToSend, clientTime, isCancellation } = req.body;

        if (!buyer || !molType) {
            throw new APIError(module, 400, 'Invalid buyer');
        }

        const molToCheck = { type: molType, data: buyer, blocked: false };

        const { updatedBuyer } = await basket(ctx(req), {
            molToCheck,
            basket: basketToSend,
            clientTime,
            isCancellation
        });

        log.info(`processing basket of ${updatedBuyer.id} sold by ${req.user.id}`, req.details);

        return res
            .status(200)
            .json(updatedBuyer)
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
        if (
            !req.body.buyer ||
            !req.body.molType ||
            !Number.isInteger(req.body.cateringId) ||
            !req.body.name
        ) {
            throw new APIError(module, 400, 'Invalid catering');
        }

        req.details.buyer = req.body.buyer;

        const { name, cateringId, clientTime } = req.body;
        const molToCheck = {
            type: req.body.molType,
            data: req.body.buyer,
            blocked: false
        };

        log.info(`processing catering`, req.details);

        await catering(ctx(req), { molToCheck, name, cateringId, clientTime });

        res.json({});
    })
);

module.exports = router;
