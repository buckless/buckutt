const asyncHandler = require('express-async-handler');
const log = require('@/log')(module);
const ctx = require('@/utils/ctx');
const rightsDetails = require('@/utils/rightsDetails');

const { searchuser } = require('@/actions/manager/auth/searchuser');

const router = require('express').Router();

router.get(
    '/',
    asyncHandler(async (req, res) => {
        log.info(`Search user ${req.query.name}`, req.details);

        const name = req.query.name;
        const userRights = rightsDetails(req.user, req.point.id);
        let max = req.query.limit;

        if (!userRights.admin) {
            max = Number.isNaN(parseInt(max, 10)) ? 15 : Math.min(max, 15);
        }

        const cleanedUsers = await searchuser(ctx(req), { name, max, userRights });

        res.json(cleanedUsers).end();
    })
);

module.exports = router;
