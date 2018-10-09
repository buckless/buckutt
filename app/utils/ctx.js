module.exports = req => ({
    // import models, pub, sub, config
    ...req.app.locals,

    query: req.query,
    params: req.params,

    // import middlewares values
    device: req.device,
    event: req.event,
    wiket: req.wiket,
    details: req.details,
    point: req.point,
    user: req.user,
    fingerprint: req.fingerprint,
    connectType: req.connectType,

    // import Model from modelParser (url parameter)
    model: req.model
});
