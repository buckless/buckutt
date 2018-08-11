const moment = require('moment');
const { bookshelf } = require('../lib/bookshelf');
const APIError = require('../errors/APIError');

/**
 * Retrieve the point id from the device fingerprint
 */
module.exports = async (req, res, next) => {
    req.details = {
        path: req.path,
        method: req.method
    };

    if (!req.headers['x-fingerprint'] && !req.query.fingerprint) {
        return next(new APIError(module, 401, 'Missing device fingerprint'));
    }

    req.fingerprint = req.headers['x-fingerprint'] || req.query.fingerprint;

    let event;
    let device;

    try {
        event = await bookshelf
            .knex('events')
            .limit(1)
            .then(res => (res ? res[0] : null));

        device = await req.app.locals.models.Device.where({ fingerprint: req.fingerprint })
            .fetch({ withRelated: ['wikets', 'wikets.point', 'wikets.period'] })
            .then(res => (res ? res.toJSON() : null));
    } catch (err) {
        return next(err);
    }

    /* istanbul ignore if */
    if (!device) {
        return next(
            new APIError(module, 404, 'Device not found', {
                fingerprint: req.fingerprint
            })
        );
    }

    let minPeriod = Infinity;
    let handled = false;

    req.device = device;
    req.point = {};
    req.event = event;
    req.wiket = {};
    req.details.device = req.device.name;

    const headerDate = moment(req.headers.date);
    req.date = headerDate.isValid() ? headerDate.toDate() : new Date();

    // Filters: allow an empty point but not a deleted point
    device.wikets
        .filter(wiket => (wiket.point_id && wiket.point.id) || !wiket.point_id)
        .forEach(wiket => {
            const period = wiket.period;
            const point = wiket.point;

            const diff = period.end - period.start;

            if (period.start > req.date || period.end < req.date) {
                return;
            }

            if (diff < minPeriod) {
                req.point_id = point.id;
                req.event_id = event.id;
                minPeriod = diff;

                req.point = point;
                req.wiket = wiket;
                req.device.defaultGroup_id = wiket.defaultGroup_id;

                req.details = {
                    ...req.details,
                    point: req.point.name
                };

                handled = true;
            }
        });

    if (!handled) {
        return next(new APIError(module, 404, 'No assigned points'));
    }

    return next();
};
