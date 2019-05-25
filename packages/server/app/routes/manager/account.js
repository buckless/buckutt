const asyncHandler = require('express-async-handler');
const log = require('server/app/log')(module);
const isUser = require('server/app/helpers/isUser');
const ctx = require('server/app/utils/ctx');
const APIError = require('server/app/utils/APIError');

const {
    block,
    listGroups,
    history: walletHistory,
    invoice
} = require('server/app/actions/manager/account');

const router = require('express').Router();

router.put(
    '/block',
    asyncHandler(async (req, res) => {
        isUser.loggedIn.orThrow(req.user);

        const target = await req.app.locals.models.Wallet.where({ id: req.query.wallet })
            .fetch()
            .then(wallet => (wallet ? wallet.toJSON() : null));

        if (req.user.id !== target.user_id) {
            throw new APIError(
                module,
                401,
                `This wallet doesn't belong to the logged user`,
                req.query.wallet
            );
        }

        log.info(`user ${req.user.id} blocked its card ${target.id}`);

        await block(ctx(req), { wallet_id: target.id });
        res.json({ blocked: true });
    })
);

router.get(
    '/groups',
    asyncHandler(async (req, res) => {
        if (!isUser.loggedIn(req.user)) {
            return res.json({});
        }

        const groups = await listGroups(ctx(req));

        res.json(groups);
    })
);

router.get(
    '/history',
    asyncHandler(async (req, res) => {
        isUser.loggedIn.orThrow(req.user);

        const target = await req.app.locals.models.Wallet.where({ id: req.query.wallet })
            .fetch()
            .then(wallet => (wallet ? wallet.toJSON() : null));

        if (req.user.id !== target.user_id) {
            isUser.admin.orThrow(req.user, req.point, req.date);
        }

        log.info(`get history for wallet ${target.id}`, req.details);

        const { offset, limit } = req.query;

        const { history, pending } = await walletHistory(ctx(req), {
            id: target.id,
            offset,
            limit
        });

        res.status(200)
            .json({
                history,
                pending,
                wallet: target
            })
            .end();
    })
);

router.post(
    '/invoice-number',
    asyncHandler(async (req, res) => {
        isUser.loggedIn.orThrow(req.user);

        const invoiceNumber = await invoice(ctx(req));

        res.json({ invoiceNumber });
    })
);

module.exports = router;
