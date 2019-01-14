const router = require('express').Router();

const pointId = require('@/middlewares/pointId');
const token = require('@/middlewares/token');
const accessRequired = require('@/middlewares/accessRequired');
const query = require('@/middlewares/query');
const idempotency = require('@/middlewares/idempotency');
const exposeResBody = require('@/middlewares/exposeResBody');

// api middlewares
router.use(exposeResBody, pointId, token, accessRequired, query, idempotency);
// router.use(pointId, token, accessRequired, query);

router.get('/', (_, res) => res.json({}).end());

router.use('/auth', require('./auth'));
router.use('/crud', require('./crud'));
router.use('/customer', require('./customer'));
router.use('/live', require('./live'));
router.use('/payment', require('./payment'));
router.use('/polling', require('./polling'));
router.use('/stats', require('./stats'));
router.use('/manager', require('./manager'));
router.use('/database', require('./database'));

router.use('/provider/callback', require('@/providers/reload').callback);

module.exports = router;
