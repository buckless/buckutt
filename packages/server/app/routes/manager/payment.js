const asyncHandler = require('express-async-handler');
const log = require('server/app/log')(module);
const isUser = require('server/app/helpers/isUser');
const ctx = require('server/app/utils/ctx');
const getAmountToReload = require('server/app/utils/getAmountToReload');
const APIError = require('server/app/utils/APIError');

const { getWallet, transfer, infos, accountRefund } = require('server/app/actions/manager/payment');

const router = require('express').Router();

router.post(
    '/cardRegister',
    asyncHandler(async (req, res) => {
        isUser.loggedIn.orThrow(req.user);

        log.info(`register card for ${req.body.walletId}`);

        const wallet = await req.app.locals.models.Wallet.where({
            id: req.body.walletId,
            user_id: req.user.id
        })
            .fetch()
            .then(res => (res ? res.toJSON() : null));

        if (!wallet) {
            throw new APIError(module, 400, 'Wallet not found');
        }

        const result = await req.onlinePayment({
            buyer: req.user,
            wallet,
            amount: 100,
            type: 'refund'
        });

        res.json(result);
    })
);

router.post(
    '/reload',
    asyncHandler(async (req, res) => {
        isUser.loggedIn.orThrow(req.user);

        if (!req.body.amount || !parseInt(req.body.amount, 10)) {
            throw new APIError(module, 400, 'Invalid amount', req.body);
        }

        const amountToCheck = getAmountToReload(req.event, parseInt(req.body.amount, 10));
        log.info(`reload ${req.body.walletId} ${amountToCheck}`);

        const wallet = await req.app.locals.models.Wallet.where({
            id: req.body.walletId,
            user_id: req.user.id
        })
            .fetch()
            .then(res => (res ? res.toJSON() : null));

        if (!wallet) {
            throw new APIError(module, 400, 'Wallet not found');
        }

        if (req.event.maxPerAccount && wallet.credit + amountToCheck > req.event.maxPerAccount) {
            const max = (req.event.maxPerAccount / 100).toFixed(2);
            throw new APIError(module, 400, `Maximum exceeded : ${max}€`, { user: wallet.id });
        }

        if (req.event.minReload && amountToCheck < req.event.minReload) {
            const min = (req.event.minReload / 100).toFixed(2);
            throw new APIError(module, 400, `Can not reload less than : ${min}€`);
        }

        const amount = parseInt(req.body.amount, 10);
        const result = await req.onlinePayment({
            buyer: req.user,
            wallet,
            amount,
            cardToken: req.body.cardToken,
            // used by test reloadProvider
            point: req.point.id
        });

        res.json(result);
    })
);

router.post(
    '/transfer',
    asyncHandler(async (req, res) => {
        isUser.loggedIn.orThrow(req.user);

        const debitorWallet = await getWallet(ctx(req), { id: req.body.debitor_id });

        if (!debitorWallet || req.user.id !== debitorWallet.user_id) {
            return Promise.reject(
                new APIError(
                    module,
                    401,
                    `This wallet doesn't belong to the logged user`,
                    req.query.wallet
                )
            );
        }

        const creditorWallet = await getWallet(ctx(req), { id: req.body.creditor_id });
        if (!creditorWallet) {
            throw new APIError(module, 400, 'Invalid reciever', { receiver: req.body.creditor_id });
        }

        const amount = parseInt(req.body.amount, 10);

        if (debitorWallet.id === creditorWallet.id) {
            return res.json({ newCredit: debitorWallet.credit });
        }

        req.details.user1 = debitorWallet.id;
        req.details.user2 = creditorWallet.id;
        req.details.amount = amount;

        log.info(
            `wallet ${debitorWallet.id} transferred ${amount} to ${creditorWallet.id}`,
            req.details
        );

        await transfer(ctx(req), { amount, debitorWallet, creditorWallet });

        return res.json({ newCredit: debitorWallet.credit - amount });
    })
);

router.get(
    '/infos',
    asyncHandler(async (req, res) => {
        isUser.loggedIn.orThrow(req.user);

        const wallet = await getWallet(ctx(req), { id: req.query.wallet_id });

        if (!wallet || req.user.id !== wallet.user_id) {
            return Promise.reject(
                new APIError(
                    module,
                    401,
                    `This wallet doesn't belong to the logged user`,
                    req.query.wallet
                )
            );
        }

        const result = await infos(ctx(req), { wallet });

        res.json(result);
    })
);

router.post(
    '/accountRefund',
    asyncHandler(async (req, res) => {
        isUser.loggedIn.orThrow(req.user);

        const wallet = await getWallet(ctx(req), { id: req.body.wallet_id });

        if (!wallet || req.user.id !== wallet.user_id) {
            return Promise.reject(
                new APIError(
                    module,
                    401,
                    `This wallet doesn't belong to the logged user`,
                    req.query.wallet
                )
            );
        }

        const refundData = (await infos(ctx(req), { wallet })).refunds;

        if (!refundData.allowed || !refundData.cardRegistered) {
            throw new APIError(module, 403, 'Not authorized to refund');
        }

        const refund = await accountRefund(ctx(req), { refundData, wallet });

        return res.json({
            ...refundData,
            allowed: false,
            alreadyAsked: refund,
            minimum: req.event.minimumAccountRefund
        });
    })
);

module.exports = router;
