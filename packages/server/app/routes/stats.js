const asyncHandler = require('express-async-handler');
const log = require('server/app/log')(module);
const isUser = require('server/app/helpers/isUser');
const ctx = require('server/app/utils/ctx');
const APIError = require('server/app/utils/APIError');

const {
    statsPurchases,
    statsWithdrawals,
    statsReloads,
    statsRefunds,
    graphGlobal,
    graphPurchases,
    graphPointsDivision
} = require('server/app/actions/stats');

const router = require('express').Router();

const logStr = (route, query) => {
    let log = `Get ${route}`;

    if (query.point) {
        log += ` on point ${query.point}`;
    }
    if (query.fundation) {
        log += ` for fundation ${query.fundation}`;
    }

    return log;
};

router.get(
    '/purchases',
    asyncHandler(async (req, res) => {
        isUser.admin.orThrow(req.user, req.point, req.date);

        const stats = await statsPurchases(ctx(req), {
            dateIn: req.query.dateIn,
            dateOut: req.query.dateOut,
            point: req.query.point,
            fundation: req.query.fundation
        });

        req.details.queryPoint = req.query.point;
        req.details.queryFundation = req.query.fundation;

        log.info(logStr('purchases', req.query));

        res.json(stats);
    })
);

router.get(
    '/withdrawals',
    asyncHandler(async (req, res) => {
        isUser.admin.orThrow(req.user, req.point, req.date);

        const stats = await statsWithdrawals(ctx(req), {
            dateIn: req.query.dateIn,
            dateOut: req.query.dateOut,
            point: req.query.point
        });

        req.details.queryPoint = req.query.point;

        log.info(logStr('withdrawals', req.query));

        res.json(stats);
    })
);

router.get(
    '/reloads',
    asyncHandler(async (req, res) => {
        isUser.admin.orThrow(req.user, req.point, req.date);

        const stats = await statsReloads(ctx(req), {
            dateIn: req.query.dateIn,
            dateOut: req.query.dateOut,
            point: req.query.point
        });

        req.details.queryPoint = req.query.point;

        log.info(logStr('reloads', req.query));

        res.json(stats);
    })
);

router.get(
    '/refunds',
    asyncHandler(async (req, res) => {
        isUser.admin.orThrow(req.user, req.point, req.date);

        const stats = await statsRefunds(ctx(req), {
            dateIn: req.query.dateIn,
            dateOut: req.query.dateOut,
            point: req.query.point
        });

        log.info(logStr('refunds', req.query));

        res.json(stats);
    })
);

router.get(
    '/purchases/csv',
    asyncHandler(async (req, res) => {
        isUser.admin.orThrow(req.user, req.point, req.date);

        const csv = await statsPurchases(ctx(req), {
            dateIn: req.query.dateIn,
            dateOut: req.query.dateOut,
            point: req.query.point,
            fundation: req.query.fundation,
            csv: true
        });

        log.info(`export ${logStr('purchases', req.query)}`);

        res.send(csv);
    })
);

router.get(
    '/withdrawals/csv',
    asyncHandler(async (req, res) => {
        isUser.admin.orThrow(req.user, req.point, req.date);

        const csv = await statsWithdrawals(ctx(req), {
            dateIn: req.query.dateIn,
            dateOut: req.query.dateOut,
            point: req.query.point,
            csv: true
        });

        log.info(`export ${logStr('withdrawals', req.query)}`);

        res.send(csv);
    })
);

router.get(
    '/reloads/csv',
    asyncHandler(async (req, res) => {
        isUser.admin.orThrow(req.user, req.point, req.date);

        const csv = await statsReloads(ctx(req), {
            dateIn: req.query.dateIn,
            dateOut: req.query.dateOut,
            point: req.query.point,
            csv: true
        });

        log.info(`export ${logStr('reloads', req.query)}`);

        res.send(csv);
    })
);

router.get(
    '/refunds/csv',
    asyncHandler(async (req, res) => {
        isUser.admin.orThrow(req.user, req.point, req.date);

        const csv = await statsRefunds(ctx(req), {
            dateIn: req.query.dateIn,
            dateOut: req.query.dateOut,
            point: req.query.point,
            csv: true
        });

        log.info(`export ${logStr('refunds', req.query)}`);

        res.send(csv);
    })
);

router.get(
    '/graphs/global',
    asyncHandler(async (req, res) => {
        isUser.admin.orThrow(req.user, req.point, req.date);

        const globalData = await graphGlobal(ctx(req));

        log.info(logStr('globalGraph', req.query));

        res.json(globalData);
    })
);

router.get(
    '/graphs/purchases',
    asyncHandler(async (req, res) => {
        if (!req.query.filters) {
            throw new APIError(module, 400, 'Filters are missing');
        }

        const dateIn = req.query.dateIn;
        const dateOut = req.query.dateOut;
        const filters = JSON.parse(req.query.filters);
        const additive = !!req.query.additive;

        const graph = await graphPurchases(ctx(req), { dateIn, dateOut, additive, filters });

        log.info(logStr('purchasesGraph', req.query));

        res.json(graph);
    })
);

router.get(
    '/graphs/pointsDivision',
    asyncHandler(async (req, res) => {
        const graph = await graphPointsDivision(ctx(req), {
            dateIn: req.query.dateIn,
            dateOut: req.query.dateOut
        });

        log.info(logStr('pointsDivisionGraph', req.query));

        res.json(graph);
    })
);

module.exports = router;
