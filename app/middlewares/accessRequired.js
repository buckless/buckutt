const config = require('@/config');
const APIError = require('@/utils/APIError');

/**
 * Check for the current user wether he can do what he wants
 */
module.exports = (req, _, next) => {
    const authorize = config.rights;

    const needToken = !(config.rights.openUrls.indexOf(req.path) > -1);

    if (!needToken) {
        return next();
    }

    if (req.user && config.rights.loggedUrls.indexOf(req.path) > -1) {
        return next();
    }

    const rights = (req.user || {}).rights || [];
    let url = req.path;
    const method = req.method;

    let handled = false;

    for (const right of rights) {
        if (right.period.start > req.date || right.period.end < req.date) {
            return;
        }

        // admin/treasurer : he does whatever he wants
        if (authorize.all.indexOf(right.name) > -1) {
            handled = true;

            return next();
        }

        const uuid = /[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;

        if (uuid.test(url)) {
            url = url.slice(0, -37);
        }

        // get : check for read authorizations
        // post/put/delete : check for write authorizations
        if (method.toLowerCase() === 'get' && authorize[right.name].read.indexOf(url) > -1) {
            handled = true;

            return next();
        } else if (authorize[right.name].write.indexOf(url) > -1) {
            handled = true;

            return next();
        }
    }

    if (!handled) {
        return next(new APIError(module, 401, 'Unauthorized: insufficient rights'));
    }
};
