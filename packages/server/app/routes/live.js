const sseExpress = require('sse-express');
const log = require('server/app/log')(module);

const { alert, healthalert, modelChanges, credit } = require('server/app/actions/live');

const router = require('express').Router();

// alert
router.get('/alert', sseExpress(), (req, res) => {
    req.details.sse = true;

    const sub = alert().subscribe(data => {
        log.info(`alert "${data.content}" for ${data.minimumViewTime}sec`);

        res.sse({ data });
    });

    res.sse({ data: { status: 'ok' } });
    res.on('close', () => sub.unsubscribe());
});

// health alert
router.get('/healthalert', sseExpress(), (req, res) => {
    req.details.sse = true;

    const sub = healthalert().subscribe(data => {
        log.info(
            `health-alert ${data.location}(${data.people},${data.notAlcohol},${data.blood},${
                data.closedEyes
            })`
        );

        res.sse({ data });
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
router.get('/status', sseExpress(), (req, res) => {
    req.details.sse = true;

    res.sse({
        data: { status: 'ok' }
    });
});

module.exports = router;
