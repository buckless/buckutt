const asyncHandler = require('express-async-handler');
const log = require('@/log')(module);
const sanitizeUser = require('@/utils/sanitizeUser');
const ctx = require('@/utils/ctx');
const APIError = require('@/utils/APIError');

const { block, listGroups, history: accountHistory } = require('@/actions/manager/account');

const router = require('express').Router();

router.put(
    '/block',
    asyncHandler(async (req, res) => {
        log.info(`user ${req.user.id} blocked his cards`);

        await block(ctx(req), { user_id: req.user.id });
        res.json({ blocked: true });
    })
);

router.get(
    '/groups',
    asyncHandler(async (req, res) => {
        if (!req.user) {
            return res.json({});
        }

        const groups = await listGroups(ctx(req));

        res.json(groups);
    })
);

router.get(
    '/history',
    asyncHandler(async (req, res) => {
        const adminRight = req.user.rights.find(
            right => right.name === 'admin' && right.period.end > new Date()
        );

        const targetUser = adminRight && req.query.buyer ? req.query.buyer : req.user.id;

        const target = await req.app.locals.models.User.where({ id: targetUser })
            .fetch({ withRelated: ['meansOfLogin', 'rights', 'rights.period'] })
            .then(user => (user ? user.toJSON() : null));

        if (!target) {
            return Promise.reject(new APIError(module, 404, 'User not found', targetUser));
        }

        log.info(`get history for user ${target.id}`, req.details);

        const { offset, limit } = req.query;

        const { history, pending } = await accountHistory(ctx(req), {
            id: target.id,
            offset,
            limit
        });

        res.status(200)
            .json({
                user: sanitizeUser(req.user, req.point.id),
                pending,
                history
            })
            .end();
    })
);

module.exports = router;
