const sseExpress = require('sse-express');
const log = require('@/log')(module);

const { alert, modelChanges, credit } = require('@/actions/live');

const router = require('express').Router();

// alert
router.get('/alert', sseExpress(), (req, res) => {
    req.details.sse = true;

    const sub = alert().subscribe(data => {
        log.info(`alert "${data.content}" for ${data.minimumViewTime}sec`);

        res.sse({ data: data });
    });

    res.sse({ data: { status: 'ok' } });
    res.on('close', () => sub.unsubscribe());
});

// model changes
router.get('/listenForModelChanges', sseExpress(), (req, res) => {
    req.details.sse = true;

    const sub = modelChanges().subscribe(data => {
        res.sse({ data });
    });

    res.sse({ data: { status: 'ok' } });
    res.on('close', () => sub.unsubscribe());
});

// user credit update
router.get('/credit', sseExpress(), (req, res) => {
    req.details.sse = true;

    const sub = credit(req.user.id).subscribe(data => {
        res.sse({ data });
    });

    res.sse({ data: { status: 'ok' } });
    res.on('close', () => sub.unsubscribe());
});

// status
router.get('/status', sseExpress(), (req, res, next) => {
    req.details.sse = true;

    res.sse({
        data: { status: 'ok' }
    });
});


module.exports = router;
