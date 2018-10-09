const router = require('express').Router();

router.use('/account', require('./account'));
router.use('/auth', require('./auth'));
router.use('/payment', require('./payment'));
router.use('/searchuser', require('./searchuser'));

module.exports = router;
