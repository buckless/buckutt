module.exports = function headers(connector) {
    connector.header('point', connector.point_id);
    connector.header('pointName', connector.point.name);
    connector.header('event', connector.event_id);
    connector.header('eventName', connector.event.name);
    connector.header('wiket', connector.wiket.id);
    connector.header('device', connector.device.id);

    return Promise.resolve();
};
