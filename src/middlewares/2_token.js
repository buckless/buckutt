const promisifyAll = require('util-promisifyall');
const jwt = promisifyAll(require('jsonwebtoken'));
const APIError = require('../errors/APIError');
const config = require('../../config');

/**
 * Parses the client token
 */
module.exports = async (req, res, next) => {
    const secret = config.app.secret;

    // OpenUrls : no token required
    const needToken = !(config.rights.openUrls.indexOf(req.path) > -1);

    const authorization = req.headers.authorization || req.query.authorization;

    if (!needToken && !authorization) {
        return next();
    }

    // Skip token at login
    if (req.path === '/services/login') {
        return next();
    }

    // Config is invalid
    /* istanbul ignore if */
    if (!secret) {
        throw new Error('config.app.secret must be set');
    }

    // Missing header
    if (!(req.headers && authorization)) {
        return next(
            new APIError(
                module,
                400,
                'No token or scheme provided. Header format is Authorization: Bearer [token]'
            )
        );
    }

    const parts = authorization.split(' ');
    // Invalid format (`Bearer Token`)
    if (parts.length !== 2) {
        return next(
            new APIError(
                module,
                400,
                'No token or scheme provided. Header format is Authorization: Bearer [token]'
            )
        );
    }

    const scheme = parts[0];
    const bearer = parts[1];
    // Invalid format (`Bearer Token`)
    if (scheme.toLowerCase() !== 'bearer') {
        return next(
            new APIError(
                module,
                400,
                'Scheme is `Bearer`. Header format is Authorization: Bearer [token]'
            )
        );
    }

    let connectType;

    const pinLoggingAllowed = config.rights.pinLoggingAllowed;
    const now = req.date;

    let decoded;

    try {
        decoded = await jwt.verifyAsync(bearer, secret);
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return next(new APIError(module, 401, 'Token expired'));
        }

        if (err instanceof jwt.JsonWebTokenError) {
            return next(new APIError(module, 401, 'Invalid token', { bearer }));
        }

        next(err);
    }

    const userId = decoded.id;
    connectType = decoded.connectType;

    console.log(decoded);

    const [user, point] = await Promise.all([
        req.app.locals.models.User.where({ id: userId }).fetch({
            withRelated: ['rights', 'rights.period', 'rights.point']
        }),
        req.app.locals.models.Point.where({ id: decoded.point }).fetch()
    ]).then(([resUser, resPoint]) => [
        resUser ? resUser.toJSON() : null,
        resPoint ? resPoint.toJSON() : null
    ]);

    if (!user) {
        return next(new APIError(module, 500, 'User has been deleted'));
    }

    req.user = user;

    req.point_id = point.id;
    req.point = point;

    req.connectType = connectType;

    // Rights are deactivated if the request comes from manager or from admin with pin login
    if (req.device.name === 'manager' || (req.device.name === 'admin' && connectType === 'pin')) {
        req.user.rights = [];
    } else {
        req.user.rights = req.user.rights.filter(right => {
            // If pin is not allowed with this right, pass
            if (connectType === 'pin' && pinLoggingAllowed.indexOf(right.name) === -1) {
                return false;
            }

            if (right.period.start <= now && right.period.end > now) {
                if (right.name !== 'admin' && right.point) {
                    return !right.point.isRemoved && right.point.id === req.point_id;
                }

                return true;
            }

            // This right should not be added as it is over
            return false;
        });
    }

    req.details.operator = {
        id: user.id,
        rights: req.user.rights.map(right => ({
            name: right.name,
            end: right.period.end
        }))
    };

    return next();
};
