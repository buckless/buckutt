const config = require('../../config');

module.exports = (user, pointId) => {
    const now = new Date();
    const result = {
        sell: false,
        reload: false,
        assign: false,
        control: false,
        admin: false,
        operator: false,
        hasAny: false
    };

    /* istanbul ignore if */
    if (!user || !user.rights) {
        return result;
    }

    for (const right of user.rights) {
        if (!(right.point_id && right.point_id !== pointId)) {
            if (right.period.start <= now && right.period.end > now) {
                if (right.name === 'admin') {
                    result.admin = result.hasAny = true;
                }

                const configRight = config.rights[right.name];

                if (configRight && configRight.canSell) {
                    result.sell = result.hasAny = true;
                }

                if (configRight && configRight.canReload) {
                    result.reload = result.hasAny = true;
                }

                if (configRight && configRight.canAssign) {
                    result.assign = result.hasAny = true;
                }

                if (configRight && configRight.canControl) {
                    result.control = result.hasAny = true;
                }
            }
        }
    }

    if (result.sell || result.reload || result.assign || result.control) {
        result.operator = true;
    }

    return result;
};
