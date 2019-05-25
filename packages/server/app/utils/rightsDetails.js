module.exports = (user, pointId, date = new Date()) => {
    const result = {
        sell: false,
        reload: false,
        assign: false,
        control: false,
        admin: false,
        operator: false
    };

    /* istanbul ignore if */
    if (!user || !user.rights) {
        return result;
    }

    for (const right of user.rights) {
        if (!(right.point_id && right.point_id !== pointId)) {
            if (right.period.start <= date && right.period.end > date) {
                if (right.name === 'admin') {
                    result.admin = true;
                }

                if (right.name === 'seller') {
                    result.sell = true;
                }

                if (right.name === 'reloader') {
                    result.reload = true;
                }

                if (right.name === 'assigner') {
                    result.assign = true;
                }

                if (right.name === 'controller') {
                    result.control = true;
                }
            }
        }
    }

    if (result.sell || result.reload || result.assign || result.control) {
        result.operator = true;
    }

    return result;
};
