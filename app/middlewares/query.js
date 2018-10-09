const APIError = require('@/utils/APIError');

const types = {
    q: 'object',
    or: 'object',
    embed: 'object',
    filter: 'object',
    limit: 'number',
    offset: 'number'
};

const interpolate = {
    object: str => JSON.parse(str),
    number: str => parseInt(str, 10)
};

/**
 * Parses the query to build the future rethink call
 */
module.exports = (req, res, next) => {
    for (const q of Object.keys(types)) {
        if (req.query.hasOwnProperty(q)) {
            if (typeof req.query[q] !== types[q]) {
                const interpolater = interpolate[types[q]];

                try {
                    req.query[q] = interpolater(req.query[q]);
                } catch (e) {
                    return next(new APIError(module, 400, 'Bad Input', `Invalid query ${q}`));
                }
            }
        }
    }

    return next();
};
