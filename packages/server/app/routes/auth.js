const asyncHandler = require('express-async-handler');
const log = require('@/log')(module);
const sanitizeUser = require('@/utils/sanitizeUser');
const ctx = require('@/utils/ctx');
const APIError = require('@/utils/APIError');

const {
    checkDevice,
    registerDevice,
    fetchTicket,
    validateLoginBody,
    login
} = require('@/actions/auth');

const router = require('express').Router();

router.get(
    '/checkDevice',
    asyncHandler(async (req, res) => {
        log.info(`Check device registration state`, req.details);

        const { name, authorized, newPrivateKey, config } = await checkDevice(ctx(req), req.device);
        res.json({ name, authorized, newPrivateKey, config });
    })
);

router.post(
    '/registerDevice',
    asyncHandler(async (req, res) => {
        log.info(`Register a new device`, req.details);

        const { name, authorized } = await registerDevice(ctx(req), req.fingerprint);
        res.json({ name, authorized });
    })
);

router.get(
    '/assigner',
    asyncHandler(async (req, res) => {
        const ticketOrMail = req.query.ticketOrMail;

        if (!ticketOrMail || ticketOrMail.length === 0) {
            throw new APIError(module, 400, 'Invalid ticketOrMail');
        }

        log.info(`Search results for ticket ${ticketOrMail}`, req.details);

        const user = await fetchTicket(ctx(req), ticketOrMail);
        res.json([user]);
    })
);

router.post(
    '/login',
    asyncHandler(async (req, res) => {
        await validateLoginBody(req.body);

        const connectType = req.body.hasOwnProperty('pin') ? 'pin' : 'password';
        const infos = {
            meanOfLogin: req.body.meanOfLogin.toString(),
            data: req.body.data
                .toString()
                .toLowerCase()
                .trim(),
            connectType
        };

        const { pin, password } = req.body;

        req.details.infos = infos;

        let { user, linkedUsers, token } = await login(ctx(req), {
            infos,
            pin,
            password
        });

        user = sanitizeUser(user, req.wiket.point.id);

        log.info(
            `login with mol ${infos.meanOfLogin}(${infos.data}) and ${infos.connectType}`,
            req.details
        );

        return res.json({ user, linkedUsers, token });
    })
);

module.exports = router;
