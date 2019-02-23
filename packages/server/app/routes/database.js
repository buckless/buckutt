const asyncHandler = require('express-async-handler');
const log = require('server/app/log')(module);
const ctx = require('server/app/utils/ctx');
const APIError = require('server/app/utils/APIError');

const { erase } = require('server/app/actions/database');

const router = require('express').Router();

router.post(
    '/erase',
    asyncHandler(async (req, res) => {
        if (process.env.NODE_ENV !== 'development') {
            throw new APIError(module, 400, 'Server is not in development mode');
        }

        log.info(`reset database call from ${req.user.id}`, req.details);

        await erase(ctx(req));

        res.json({});
    })
);

module.exports = router;
