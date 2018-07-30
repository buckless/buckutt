const express = require('express');
const sseExpress = require('sse-express');
const uuid = require('uuid');
const log = require('../../lib/log')(module);

/**
 * Alert controller
 */
const router = new express.Router();

router.get('/live/alert', sseExpress(), (req, res, next) => {
    req.details.sse = true;

    const handler = (channel, msg) => {
        if (channel !== 'data') {
            return;
        }

        if (!msg || msg.length === 0) {
            return;
        }

        const { action, model, data } = JSON.parse(msg);

        if (action !== 'create' || model !== 'Alert') {
            return;
        }

        let alert = data.to[0];
        log.info(`Alert "${alert.content}" for ${alert.minimumViewTime} sec`);

        res.sse({
            data: alert
        });
    };

    req.app.locals.sub.on('message', handler);
    res.on('close', () => req.app.locals.sub.off('message', handler));
});

module.exports = router;
