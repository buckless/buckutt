const router = require('express').Router();

const pointId = require('server/app/middlewares/pointId');
const token = require('server/app/middlewares/token');
const query = require('server/app/middlewares/query');
const idempotency = require('server/app/middlewares/idempotency');
const exposeResBody = require('server/app/middlewares/exposeResBody');

// api middlewares
router.use(exposeResBody, pointId, token, query, idempotency);

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

router.use('/provider/callback', require('server/app/providers/reload').callback);

module.exports = router;
