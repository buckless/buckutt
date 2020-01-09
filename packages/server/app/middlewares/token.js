const promisifyAll = require('util-promisifyall');
const jwt = promisifyAll(require('jsonwebtoken'));
const config = require('server/app/config');
const APIError = require('server/app/utils/APIError');

const pinLoggingAllowed = ['seller', 'reloader', 'assigner', 'controller'];
const openUrls = [
    '/',
    '/auth/login',
    '/auth/checkDevice',
    '/auth/registerDevice',
    '/manager/auth/forgot',
    '/manager/auth/resetPassword',
    '/manager/auth/register',
    '/polling/eventEssentials',
    '/live/status',
    '/provider/callback'
];

/**
 * Parses the client token
 */
module.exports = async (req, res, next) => {
    const secret = config.app.secret;

    // openUrls : no token required
    const needToken = !(openUrls.indexOf(req.path) > -1);

    const authorization = req.headers.authorization || req.query.authorization;

    if (!needToken && !authorization) {
        return next();
    }

    // config is invalid
    if (!secret) {
        throw new Error('config.app.secret must be set');
    }

    // missing header
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
    // invalid format (`Bearer Token`)
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
    // invalid format (`Bearer Token`)
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

    const [user, wiket] = await Promise.all([
        req.app.locals.models.User.where({ id: userId }).fetch({
            withRelated: ['rights', 'rights.period', 'rights.point']
        }),
        req.app.locals.models.Wiket.where({ id: decoded.wiket }).fetch({
            withRelated: ['point', 'period'],
            withDeleted: true
        })
    ]).then(([resUser, resWiket]) => [
        resUser ? resUser.toJSON() : null,
        resWiket ? resWiket.toJSON() : null
    ]);

    if (!user) {
        return next(new APIError(module, 500, 'User has been deleted'));
    }

    req.user = user;
    req.wiket = wiket;
    req.point = wiket.point;

    req.connectType = connectType;

    // rights are deactivated if the request comes from manager or from admin with pin login
    if (req.device.name === 'manager' || (req.device.name === 'admin' && connectType === 'pin')) {
        req.user.rights = [];
    } else {
        req.user.rights = req.user.rights.filter(right => {
            // if pin is not allowed with this right, pass
            if (connectType === 'pin' && pinLoggingAllowed.indexOf(right.name) === -1) {
                return false;
            }

            if (right.period.start <= now && right.period.end > now) {
                if (right.name !== 'admin' && right.point) {
                    return !right.point.isRemoved && right.point.id === req.wiket.point.id;
                }

                return true;
            }

            // this right should not be added as it is over
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
