const crypto = require('crypto');
const moment = require('moment');
const { bookshelf } = require('server/app/db');
const APIError = require('server/app/utils/APIError');

const keyGenerationPaths = ['/auth/checkDevice', '/auth/registerDevice'];

/**
 * Retrieve the point id from the device fingerprint
 */
module.exports = async (req, res, next) => {
    req.details = {
        path: req.path,
        method: req.method
    };

    req.fingerprint = req.headers['x-fingerprint'] || req.query.fingerprint;

    if (!req.fingerprint) {
        return next(new APIError(module, 401, 'Missing device fingerprint'));
    }

    let event;
    let device;

    try {
        event = await bookshelf
            .knex('events')
            .limit(1)
            .then(res => (res ? res[0] : null));

        device = await req.app.locals.models.Device.where({
            fingerprint: req.fingerprint
        })
            .fetch({ withRelated: ['wikets', 'wikets.point', 'wikets.period'] })
            .then(res => (res ? res.toJSON() : null));
    } catch (err) {
        return next(err);
    }

    req.device = device;

    if (keyGenerationPaths.indexOf(req.path) > -1) {
        return next();
    }

    /* istanbul ignore if */
    if (!device) {
        return next(new APIError(module, 404, 'Device not found'));
    }

    if (!device.authorized) {
        return next(new APIError(module, 401, 'Unauthorized device'));
    }

    req.signature = req.headers['x-signature'] || req.query.signature;

    if (!req.signature) {
        return next(new APIError(module, 401, 'Device signature is missing'));
    }

    const payloadToCompare = `${req.fingerprint}-${req.method}-${req.path}`;
    const hmac = crypto.createHmac('sha256', device.privateKey).update(payloadToCompare);
    const signatureToCompare = hmac.digest('hex');

    if (req.signature !== signatureToCompare) {
        return next(new APIError(module, 401, 'Wrong device signature'));
    }

    let minPeriod = Infinity;
    let handled = false;

    req.event = event;
    req.wiket = {};
    req.details.device = req.device.name;

    const headerDate = moment(req.headers.date);
    req.date = headerDate.isValid() ? headerDate.toDate() : new Date();

    // filters: allow an empty point but not a deleted point
    device.wikets
        .filter(wiket => (wiket.point_id && wiket.point.id) || !wiket.point_id)
        .forEach(wiket => {
            const period = wiket.period;
            const diff = period.end - period.start;

            if (period.start > req.date || period.end < req.date) {
                return;
            }

            if (diff < minPeriod) {
                minPeriod = diff;

                req.wiket = wiket;
                req.point = wiket.point;

                req.details = {
                    ...req.details,
                    point: wiket.point.name
                };

                handled = true;
            }
        });

    if (!handled) {
        return next(new APIError(module, 404, 'No assigned points'));
    }

    return next();
};
