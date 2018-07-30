const express = require('express');
const sseExpress = require('sse-express');
const uuid = require('uuid');
const log = require('../../lib/log')(module);

/**
 * Status controller
 */
const router = new express.Router();

router.get('/live/status', sseExpress(), (req, res, next) => {
    req.details.sse = true;

    res.sse({
        data: { status: 'ok' }
    });
});

module.exports = router;
