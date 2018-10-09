const asyncHandler = require('express-async-handler');
const log = require('@/log')(module);
const ctx = require('@/utils/ctx');
const APIError = require('@/utils/APIError');

const {
    statsPurchases,
    statsWithdrawals,
    statsReloads,
    statsRefunds,
    graphPurchases
} = require('@/actions/stats');

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
        const stats = await statsReloads(ctx(req), {
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
    '/refunds',
    asyncHandler(async (req, res) => {
        const stats = await statsRefunds(ctx(req), {
            dateIn: req.query.dateIn,
            dateOut: req.query.dateOut
        });

        log.info(logStr('refunds', req.query));

        res.json(stats);
    })
);

router.get(
    '/purchases/csv',
    asyncHandler(async (req, res) => {
        const csv = await csv(ctx(req), {
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
        const csv = await csv(ctx(req), {
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
        const csv = await csv(ctx(req), {
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
        const csv = await csv(ctx(req), {
            dateIn: req.query.dateIn,
            dateOut: req.query.dateOut,
            csv: true
        });

        log.info(`export ${logStr('refunds', req.query)}`);

        res.send(csv);
    })
);

router.get(
    '/graphs/purchases',
    asyncHandler(async (req, res) => {
        if (!req.query.filters) {
            throw new APIError(module, 400, 'Filters are missing');
        }

        let dateIn, dateOut;

        if (req.query.dateIn && req.query.dateOut) {
            dateIn = new Date(req.query.dateIn);
            dateOut = new Date(req.query.dateOut);

            if (Number.isNaN(dateIn.getTime()) || Number.isNaN(dateOut.getTime())) {
                throw new APIError(module, 400, 'Invalid dates');
            }
        } else {
            if (Number.isNaN(dateIn.getTime()) || Number.isNaN(dateOut.getTime())) {
                throw new APIError(module, 400, 'Dates are missing');
            }
        }

        const filters = JSON.parse(req.query.filters);

        const graph = await graphPurchases(ctx(req), { dateIn, dateOut, filters });

        res.json(graph);
    })
);

module.exports = router;
