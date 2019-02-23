const APIError = require('server/app/utils/APIError');

module.exports = (query, dateIn, dateOut) => {
    if (dateIn && dateOut) {
        const start = new Date(dateIn);
        const end = new Date(dateOut);

        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
            query = query.where('clientTime', '>=', start).where('clientTime', '<=', end);
        } else {
            throw new APIError(module, 400, 'Invalid dates');
        }
    }

    return query;
};
