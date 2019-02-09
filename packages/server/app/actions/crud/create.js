const { embedFilter } = require('@/utils/embedParser');
const modelParser = require('@/utils/modelParser');

module.exports = async (ctx, insts, { withRelated, embedFilters }) => {
    let results = await Promise.all(insts.map(inst => inst.save()));

    results = await ctx.model.where('id', 'in', results.map(i => i.id)).fetchAll({ withRelated });

    ctx.pub.publish(
        'data',
        JSON.stringify({
            action: 'create',
            model: modelParser.modelsNames[ctx.params.model],
            data: { from: null, to: results }
        })
    );

    return embedFilter(embedFilters, results.toJSON());
};
