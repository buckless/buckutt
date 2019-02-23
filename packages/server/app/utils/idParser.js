const APIError = require('server/app/utils/APIError');

const uuid = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

// idParser, suitable for req.param
const id = (_, __, next, value) => {
    if (uuid.test(value) || value === 'search') {
        return next();
    }

    return next(new APIError(module, 400, 'id is not an uuid'));
};

module.exports = id;

/**
 * Check if string is unique id
 * @param  {String} str Input string
 * @return {Boolean} True if string is unique id
 */
module.exports.isUUID = str => uuid.test(str);
