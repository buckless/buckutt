const asyncHandler = require('express-async-handler');
const log = require('server/app/log')(module);
const isUser = require('server/app/helpers/isUser');
const ctx = require('server/app/utils/ctx');
const APIError = require('server/app/utils/APIError');

const { erase } = require('server/app/actions/database');

const router = require('express').Router();

const isDev = process.env.NODE_ENV === 'development';

router.post(
    '/erase',
    asyncHandler(async (req, res) => {
        isUser.admin.orThrow(req.user, req.point, req.date);

        if (!isDev) {
            throw new APIError(module, 400, 'Server is not in development mode');
        }

        log.info(`reset database call from ${req.user.id}`, req.details);

        await erase(ctx(req));

        res.json({});
    })
);

module.exports = router;
