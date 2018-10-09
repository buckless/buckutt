const url = require('url');
const qs = require('qs');
const { embedParser } = require('@/utils/embedParser');
const APIError = require('@/utils/APIError');

// set common variables used in all crud routes
module.exports = (req, res, next) => {
    // embed
    const withRelated = req.query.embed ? embedParser(req.query.embed) : [];
    const embedFilters = req.query.embed
        ? req.query.embed.filter(rel => rel.required).map(rel => rel.embed)
        : [];

    // json search (express doesn't support encoded json in querystring)
    const queryString = url.parse(req.url).query;
    const q = qs.parse(queryString).q;

    let filters;

    if (q) {
        try {
            filters = Array.isArray(q) ? q.map(subQ => JSON.parse(subQ)) : JSON.parse(q);
        } catch (e) {
            return next(new APIError(module, 400, 'Invalid search object', e));
        }
    }

    req.crud = { withRelated, embedFilters, filters };

    next();
};
