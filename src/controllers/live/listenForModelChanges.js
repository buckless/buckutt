const express = require('express');
const sseExpress = require('sse-express');
const uuid = require('uuid');
const invert = require('lodash.invert');
const { modelsNames } = require('../../lib/modelParser');
const log = require('../../lib/log')(module);

/**
 * Model update
 */
const router = new express.Router();

const routeNames = invert(modelsNames);

router.get('/live/models', sseExpress(), (req, res, next) => {
    req.details.sse = true;

    const models = (req.query.models || '').split(',').map(m => modelsNames[m.toLowerCase()]);

    const handler = (channel, msg) => {
        if (channel !== 'data') {
            return;
        }

        if (!msg || msg.length === 0) {
            return;
        }

        const { action, model, data } = JSON.parse(msg);

        const route = routeNames.hasOwnProperty(model) ? routeNames[model] : null;

        res.sse({
            data: { action, model, route, data }
        });
    };

    req.app.locals.sub.on('message', handler);
    res.on('close', () => req.app.locals.sub.off('message', handler));
});

module.exports = router;
