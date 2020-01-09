const asyncHandler = require('express-async-handler');
const log = require('server/app/log')(module);
const isUser = require('server/app/helpers/isUser');
const ctx = require('server/app/utils/ctx');
const APIError = require('server/app/utils/APIError');

const {
    assignCard,
    assignWallet,
    register,
    changePassword,
    forgot,
    resetPassword,
    infos,
    style
} = require('server/app/actions/manager/auth');

const router = require('express').Router();

router.post(
    '/assignCard',
    asyncHandler(async (req, res) => {
        isUser.loggedIn.orThrow(req.user);

        const wallet = await assignCard(ctx(req), req.body);

        log.info(`assign a user, a card or a ticket to a wallet`, req.details);

        res.json(wallet);
    })
);

router.post(
    '/assignWallet',
    asyncHandler(async (req, res) => {
        isUser.loggedIn.orThrow(req.user);

        const wallet = await assignWallet(ctx(req), req.body);

        log.info(`assign a wallet to a card or a ticket`, req.details);

        res.json(wallet);
    })
);

router.post(
    '/register',
    asyncHandler(async (req, res) => {
        const user = await register(ctx(req), req.body);

        log.info(`register user ${user.firstname} ${user.lastname}`, req.details);

        req.details.date = user.created_at;
        req.details.user = {
            firstname: user.firstname,
            lastname: user.lastname,
            mail: user.mail
        };

        res.json(user);
    })
);

router.put(
    '/changePassword',
    asyncHandler(async (req, res) => {
        isUser.loggedIn.orThrow(req.user);

        const { currentPassword, password, currentPin, pin } = req.body;

        log.info(`change password or pin for user ${req.user.id}`, req.details);

        await changePassword(ctx(req), { currentPassword, password, currentPin, pin });

        res.json({ changed: true });
    })
);

router.get(
    '/forgot',
    asyncHandler(async (req, res) => {
        const mail = req.query.mail;

        const user = await forgot(ctx(req), { mail });

        req.details.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        req.details.mail = mail;
        req.details.user = user.id;

        log.info(`ip ${req.details.ip} asked password reset for user ${user.id}`, req.details);

        res.json({ success: true });
    })
);

router.put(
    '/resetPassword',
    asyncHandler(async (req, res) => {
        if (!req.body.password) {
            throw new APIError(module, 401, 'Password is missing');
        }

        if (req.body.password.length < 6) {
            throw new APIError(module, 401, 'Password is too short');
        }

        if (!req.body.key) {
            throw new APIError(module, 401, 'Key is missing');
        }

        const { password, key } = req.body;

        log.info(`generate password with key ${req.body.key}`, req.details);

        await resetPassword(ctx(req), { password, recoverKey: key });

        res.json({ success: true });
    })
);

router.get(
    '/infos',
    asyncHandler(async (req, res) => {
        isUser.loggedIn.orThrow(req.user);

        const result = await infos(ctx(req));

        res.json(result);
    })
);

router.get(
    '/style',
    asyncHandler(async (req, res) => {
        const result = await style(ctx(req));

        res.json(result);
    })
);

module.exports = router;
