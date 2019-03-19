const asyncHandler = require('express-async-handler');
const log = require('server/app/log')(module);
const sanitizeUser = require('server/app/utils/sanitizeUser');
const ctx = require('server/app/utils/ctx');
const APIError = require('server/app/utils/APIError');

const {
    checkDevice,
    registerDevice,
    fetchTicket,
    validateLoginBody,
    login,
    assigner
} = require('server/app/actions/auth');

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
        const ticketNumber = req.query.ticketNumber;

        if (!ticketNumber || ticketNumber.length === 0) {
            throw new APIError(module, 400, 'Invalid ticketNumber');
        }

        log.info(`Search results for ticket ${ticketNumber}`, req.details);

        const ticket = await fetchTicket(ctx(req), ticketNumber);
        res.json([ticket]);
    })
);

router.post(
    '/assigner',
    asyncHandler(async (req, res) => {
        const wallet = await assigner(ctx(req), req.body);

        log.info(`assign a card to a ticket`, req.details);

        res.json(wallet);
    })
);

router.post(
    '/login',
    asyncHandler(async (req, res) => {
        await validateLoginBody(req.body);

        const mail = req.body.mail ? req.body.mail.toString().toLowerCase() : undefined;
        const wallet = req.body.wallet
            ? req.body.wallet
                  .toString()
                  .toLowerCase()
                  .trim()
            : undefined;
        const connectType = req.body.hasOwnProperty('pin') ? 'pin' : 'password';
        const infos = { mail, wallet, connectType };

        const { pin, password } = req.body;

        req.details.infos = infos;

        let { user, token } = await login(ctx(req), {
            infos,
            pin,
            password
        });

        user = sanitizeUser(user, req.wiket.point.id);

        const info = infos.wallet ? `wallet ${infos.wallet}` : `mail ${infos.mail}`;

        log.info(`login with ${info} and ${infos.connectType}`, req.details);

        return res.json({ user, token });
    })
);

module.exports = router;
