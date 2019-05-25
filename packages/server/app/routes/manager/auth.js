const asyncHandler = require('express-async-handler');
const log = require('server/app/log')(module);
const isUser = require('server/app/helpers/isUser');
const ctx = require('server/app/utils/ctx');
const APIError = require('server/app/utils/APIError');

const { assignCard } = require('server/app/actions/manager/auth/assignCard');
const { assignWallet } = require('server/app/actions/manager/auth/assignWallet');
const { register } = require('server/app/actions/manager/auth/register');
const { changePin } = require('server/app/actions/manager/auth/changePin');
const { askpin } = require('server/app/actions/manager/auth/askpin');
const { generatepin } = require('server/app/actions/manager/auth/generatepin');

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
    '/changepin',
    asyncHandler(async (req, res) => {
        isUser.loggedIn.orThrow(req.user);

        const { currentPin, pin } = req.body;

        log.info(`change pin for user ${req.user.id}`, req.details);

        await changePin(ctx(req), { currentPin, pin });

        res.json({ changed: true });
    })
);

router.get(
    '/askpin',
    asyncHandler(async (req, res) => {
        const mail = req.query.mail;

        const user = await askpin(ctx(req), { mail });

        req.details.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        req.details.mail = mail;
        req.details.user = user.id;

        log.info(`ip ${req.details.ip} asked pin reset for user ${user.id}`, req.details);

        res.json({ success: true });
    })
);

router.put(
    '/generatepin',
    asyncHandler(async (req, res) => {
        if (!req.body.pin) {
            throw new APIError(module, 401, 'PIN is missing');
        }

        if (req.body.pin.length !== 4) {
            throw new APIError(module, 401, 'PIN has to be clear, not crypted');
        }

        if (!req.body.key) {
            throw new APIError(module, 401, 'Key is missing');
        }

        const { pin, key } = req.body;

        log.info(`generate pin with key ${req.body.key}`, req.details);

        await generatepin(ctx(req), { pin, recoverKey: key });

        res.json({ success: true });
    })
);

module.exports = router;
