const config = require('server/app/config');
const APIError = require('server/app/utils/APIError');

const uuid = /[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;

/**
 * Check for the current user wether he can do what he wants
 */
module.exports = (req, _, next) => {
    const authorize = config.rights;

    const needToken = !(config.rights.openUrls.indexOf(req.path) > -1);

    if (!needToken) {
        return next();
    }

    const rights = (req.user || {}).rights || [];
    const url = uuid.test(req.path) ? req.path.slice(0, -37) : req.path;
    const method = req.method;

    if (req.user && config.rights.loggedUrls.indexOf(url) > -1) {
        return next();
    }

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
