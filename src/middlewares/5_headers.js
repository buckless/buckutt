module.exports = (req, res, next) => {
    res.header('point', req.point_id);
    res.header('pointName', req.point.name);
    res.header('event', req.event_id);
    res.header('eventName', req.event.name);
    res.header('wiket', req.wiket.id);
    res.header('device', req.device.id);

    return next();
};
