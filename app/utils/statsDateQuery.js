const APIError = require('@/utils/APIError');

module.exports = (query, dateIn, dateOut) => {
    if (dateIn && dateOut) {
        const dateIn = new Date(dateIn);
        const dateOut = new Date(dateOut);

        if (!Number.isNaN(dateIn.getTime()) && !Number.isNaN(dateOut.getTime())) {
            query = query.where('clientTime', '>=', dateIn).where('clientTime', '<=', dateOut);
        } else {
            throw new APIError(module, 400, 'Invalid dates');
        }
    }
};
