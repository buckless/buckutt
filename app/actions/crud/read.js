const queryFilterer = require('@/utils/queryFilterer');
const { embedFilter } = require('@/utils/embedParser');

module.exports = async (ctx, { id, filters, withRelated, embedFilters }) => {
    let request = ctx.model;

    if (id) {
        request = request.where({ id });
    }

    if (ctx.query.orderBy) {
        request = request.orderBy(ctx.query.orderBy, ctx.query.sort || 'asc');
    }
    if (ctx.query.limit) {
        request = request.limit(ctx.query.limit);
    }
    if (ctx.query.offset) {
        request = request.offset(ctx.query.offset);
    }

    if (filters) {
        request = queryFilterer(request, filters);
    }

    const results = await request.fetchAll({ withRelated });

    return embedFilter(embedFilters, results.toJSON());
};
