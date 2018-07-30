module.exports = (req, res, next) => {
    req.header('point', req.point_id);
    req.header('pointName', req.point.name);
    req.header('event', req.event_id);
    req.header('eventName', req.event.name);
    req.header('wiket', req.wiket.id);
    req.header('device', req.device.id);

    return next();
};
