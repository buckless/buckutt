const express = require('express');
const sseExpress = require('sse-express');
const uuid = require('uuid');
const log = require('../../lib/log')(module);

/**
 * User credit update
 */
const router = new express.Router();

router.get('/live/credit', sseExpress(), (req, res, next) => {
    req.details.sse = true;

    const handler = (channel, msg) => {
        if (channel !== 'userCreditUpdate') {
            return;
        }

        if (!msg || msg.length === 0) {
            return;
        }

        const { id, credit, pending } = JSON.parse(msg);

        if (id === req.user.id) {
            res.sse({
                data: { credit, pending }
            });
        }
    };

    req.app.locals.sub.on('message', handler);
    res.on('close', () => req.app.locals.sub.off('message', handler));
});

module.exports = router;
