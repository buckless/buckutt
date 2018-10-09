const asyncHandler = require('express-async-handler');
const log = require('@/log')(module);
const ctx = require('@/utils/ctx');
const APIError = require('@/utils/APIError');

const { assigner } = require('@/actions/manager/auth/assigner');
const { register } = require('@/actions/manager/auth/register');
const { switchuser } = require('@/actions/manager/auth/switchuser');
const { changePin } = require('@/actions/manager/auth/changePin');
const { askpin } = require('@/actions/manager/auth/askpin');
const { generatepin } = require('@/actions/manager/auth/generatepin');

const router = require('express').Router();

router.post(
    '/assigner',
    asyncHandler(async (req, res) => {
        const user = await assigner(ctx(req), req.body);

        log.info(`assign user ${user.firstname} ${user.lastname}`, req.details);

        req.details.date = user.created_at;
        req.details.user = {
            firstname: user.firstname,
            lastname: user.lastname,
            mail: user.mail
        };

        res.json(user);
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

        res.status(200)
            .json(user)
            .end();
    })
);

router.post(
    '/switchuser',
    asyncHandler(async (req, res) => {
        const infos = { type: req.body.meanOfLogin.toString(), data: req.body.data.toString() };

        const errDetails = {
            mol: infos.type,
            point: req.point.id
        };

        if (req.connectType !== 'pin') {
            throw new APIError(module, 401, 'User not found', errDetails);
        }

        let { user, token } = await switchuser(ctx(req), { infos, errDetails });
        log.info(`user ${req.user.id} switched to user ${user.id}`, infos);

        return res.json({ user, token });
    })
);

router.put(
    '/changepin',
    asyncHandler(async (req, res) => {
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
