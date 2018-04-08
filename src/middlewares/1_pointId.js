const { bookshelf } = require('../lib/bookshelf');
const APIError = require('../errors/APIError');

/**
 * Retrieve the point id from the SSL certificate fingerprint
 * @param {Object} connector HTTP/Socket.IO connector
 */
module.exports = connector => {
    let event;

    return bookshelf.knex('events')
        .limit(1)
        .then(res => (res ? res[0] : null))
        .then(event_ => {
            event = event_;

            return connector.models.Device.where({ fingerprint: connector.fingerprint }).fetch({
                withRelated: ['wikets', 'wikets.point', 'wikets.period']
            });
        })
        .then(res => (res ? res.toJSON() : null))
        .then(device => {
            /* istanbul ignore if */
            if (!device || (!device.isUser && device.wikets.length === 0)) {
                return Promise.reject(
                    new APIError(module, 404, 'Device not found', {
                        fingerprint: connector.fingerprint
                    })
                );
            }

            let minPeriod = Infinity;
            let handled = false;

            connector.device = device;
            connector.point = {};
            connector.event = event;
            connector.wiket = {};
            connector.details = {
                device: connector.device.name,
                path: connector.path,
                method: connector.method
            };

            // Filters: allow an empty point but not a deleted point
            device.wikets
                .filter(wiket => (wiket.point_id && wiket.point.id) || !wiket.point_id)
                .forEach(wiket => {
                    const period = wiket.period;
                    const point = wiket.point;

                    const diff = period.end - period.start;

                    if (period.start > connector.date || period.end < connector.date) {
                        return;
                    }

                    if (diff < minPeriod) {
                        connector.point_id = point.id;
                        connector.event_id = event.id;
                        minPeriod = diff;

                        connector.point = point;
                        connector.wiket = wiket;
                        connector.device.defaultGroup_id = wiket.defaultGroup_id;

                        connector.details = {
                            ...connector.details,
                            event: connector.event.name,
                            point: connector.point.name
                        };

                        handled = true;
                    }
                });

            if (!handled && !device.isUser) {
                return Promise.reject(new APIError(module, 404, 'No assigned points'));
            }

            connector.header('point', connector.point_id);
            connector.header('pointName', connector.point.name);
            connector.header('event', connector.event_id);
            connector.header('eventName', connector.event.name);
            connector.header('wiket', connector.wiket.id);
            connector.header('device', device.id);

            return Promise.resolve();
        });
};
