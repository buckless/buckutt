const asyncHandler = require('express-async-handler');
const log = require('server/app/log')(module);
const isUser = require('server/app/helpers/isUser');
const ctx = require('server/app/utils/ctx');
const rightsDetails = require('server/app/utils/rightsDetails');

const { searchuser } = require('server/app/actions/manager/auth/searchuser');

const router = require('express').Router();

router.get(
    '/',
    asyncHandler(async (req, res) => {
        isUser.loggedIn.orThrow(req.user);

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
