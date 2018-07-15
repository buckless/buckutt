const promisifyAll = require('util-promisifyall');
const jwt = promisifyAll(require('jsonwebtoken'));
const APIError = require('../errors/APIError');
const config = require('../../config');

/**
 * Parses the client token
 * @param {Object} connector HTTP/Socket.IO connector
 */
module.exports = function token(connector) {
    const secret = config.app.secret;

    // OpenUrls : no token required
    const needToken = !(config.rights.openUrls.indexOf(connector.path) > -1);

    if (!needToken && !connector.headers.authorization) {
        return Promise.resolve();
    }

    // Skip token at login
    if (connector.path === '/services/login') {
        return Promise.resolve();
    }

    // Config is invalid
    /* istanbul ignore if */
    if (!secret) {
        throw new Error('config.app.secret must be set');
    }

    // Missing header
    if (!(connector.headers && connector.headers.authorization)) {
        const err = new APIError(
            module,
            400,
            'No token or scheme provided. Header format is Authorization: Bearer [token]'
        );
        return Promise.reject(err);
    }

    const parts = connector.headers.authorization.split(' ');
    // Invalid format (`Bearer Token`)
    if (parts.length !== 2) {
        const err = new APIError(
            module,
            400,
            'No token or scheme provided. Header format is Authorization: Bearer [token]'
        );
        return Promise.reject(err);
    }

    const scheme = parts[0];
    const bearer = parts[1];
    // Invalid format (`Bearer Token`)
    if (scheme.toLowerCase() !== 'bearer') {
        const err = new APIError(
            module,
            400,
            'Scheme is `Bearer`. Header format is Authorization: Bearer [token]'
        );
        return Promise.reject(err);
    }

    let connectType;

    const pinLoggingAllowed = config.rights.pinLoggingAllowed;
    const now = connector.date;

    return jwt
        .verifyAsync(bearer, secret)
        .then(decoded => {
            const userId = decoded.id;
            connectType = decoded.connectType;

            return Promise.all([
                connector.models.User.where({ id: userId }).fetch({
                    withRelated: ['rights', 'rights.period', 'rights.point']
                }),
                connector.models.Point.where({ id: decoded.point }).fetch()
            ]);
        })
        .then(([resUser, resPoint]) => [
            resUser ? resUser.toJSON() : null,
            resPoint ? resPoint.toJSON() : null
        ])
        .then(([user, point]) => {
            if (!user) {
                return Promise.reject(new APIError(module, 500, 'User has been deleted'));
            }
            connector.user = user;

            connector.point_id = point.id;
            connector.point = point;

            connector.connectType = connectType;

            connector.user.rights = connector.user.rights.filter(right => {
                // If pin is not allowed with this right, pass
                if (connectType === 'pin' && pinLoggingAllowed.indexOf(right.name) === -1) {
                    return false;
                }

                if (right.period.start <= now && right.period.end > now) {
                    if (right.name !== 'admin' && right.point) {
                        return !right.point.isRemoved && right.point.id === connector.point_id;
                    }

                    return true;
                }

                // This right should not be added as it is over
                return false;
            });

            connector.details.operator = {
                id: user.id,
                rights: connector.user.rights.map(right => ({
                    name: right.name,
                    end: right.period.end
                }))
            };

            return Promise.resolve();
        })
        .catch(jwt.TokenExpiredError, () =>
            Promise.reject(new APIError(module, 401, 'Token expired'))
        )
        .catch(jwt.JsonWebTokenError, () =>
            Promise.reject(new APIError(module, 401, 'Invalid token', { bearer }))
        );
};
