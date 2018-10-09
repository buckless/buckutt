const asyncHandler = require('express-async-handler');
const log = require('@/log')(module);
const ctx = require('@/utils/ctx');
const APIError = require('@/utils/APIError');

const {
    listGiftReloads,
    getReciever,
    transfer,
    canRefund,
    accountRefund
} = require('@/actions/manager/payment');

const router = require('express').Router();

router.post(
    '/reload',
    asyncHandler(async (req, res) => {
        log.info(`reload ${req.user.id} ${req.body.amount}`);

        if (!req.body.amount || !parseInt(req.body.amount, 10)) {
            throw new APIError(module, 400, 'Invalid amount', req.body);
        }

        const amount = parseInt(req.body.amount, 10);

        if (req.event.maxPerAccount && req.user.credit + amount > req.event.maxPerAccount) {
            const max = (req.event.maxPerAccount / 100).toFixed(2);
            throw new APIError(module, 400, `Maximum exceeded : ${max}€`, { user: req.user.id });
        }

        if (req.event.minReload && amount < req.event.minReload) {
            const min = (req.event.minReload / 100).toFixed(2);
            throw new APIError(module, 400, `Can not reload less than : ${min}€`);
        }

        const result = await req.onlinePayment({
            buyer: req.user,
            amount,
            // used by test reloadProvider
            point: req.point.id
        });

        res.json(result);
    })
);

router.post(
    '/transfer',
    asyncHandler(async (req, res) => {
        if (!req.body.reciever_id) {
            throw new APIError(module, 400, 'Invalid reciever', { receiver: req.body.reciever_id });
        }

        const recieverUser = await getReciever(ctx(req), { id: req.body.reciever_id });

        const amount = parseInt(req.body.amount, 10);

        if (req.user.id === recieverUser.id) {
            return res.json({ newCredit: req.user.credit });
        }

        req.details.user1 = req.user.id;
        req.details.user2 = req.body.reciever_id;
        req.details.amount = amount;

        log.info(
            `user ${req.user.id} transferred ${amount} to ${req.body.reciever_id}`,
            req.details
        );

        await transfer(ctx(req), { amount, recieverUser });

        return res.json({ newCredit: req.user.credit - amount });
    })
);

router.get(
    '/accountRefund',
    asyncHandler(async (req, res) => {
        const refund = await canRefund(req);

        res.json({
            ...refund,
            minimum: req.event.minimumAccountRefund
        });
    })
);

router.post(
    '/accountRefund',
    asyncHandler(async (req, res) => {
        const refundData = await canRefund(req);

        if (!refundData.allowed) {
            throw new APIError(module, 403, 'Not authorized to refund');
        }

        const refund = await accountRefund(ctx(req), { refundData });

        return res.json({
            ...refundData,
            allowed: false,
            alreadyAsked: refund,
            minimum: req.event.minimumAccountRefund
        });
    })
);

router.get(
    '/giftReloads',
    asyncHandler(async (req, res) => {
        const giftReloads = await listGiftReloads(ctx(req));

        res.json(giftReloads);
    })
);

module.exports = router;
