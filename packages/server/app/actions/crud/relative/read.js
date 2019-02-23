const { embedFilter } = require('server/app/utils/embedParser');
const APIError = require('server/app/utils/APIError');

module.exports = async (ctx, { id, submodel, embedFilters, withRelated }) => {
    const instance = await ctx.model
        .where({ id })
        .fetch({ require: true, withRelated })
        .then(result => (result ? embedFilter(embedFilters, [result.toJSON()])[0] : null));

    if (!instance[submodel]) {
        throw new APIError(module, 404, 'Document not found');
    }

    return instance[submodel];
};
