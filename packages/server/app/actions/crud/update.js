const { embedFilter } = require('server/app/utils/embedParser');
const modelParser = require('server/app/utils/modelParser');

module.exports = async (ctx, { id, model, data, withRelated, embedFilters }) => {
    // first, get the model
    const inst = await ctx.model.where({ id }).fetch();

    const previous = inst.toJSON();

    // update based on body values
    Object.keys(data).forEach(key => inst.set(key, data[key]));

    // has to be set manually because of the previous select
    inst.set('updated_at', new Date());

    ctx.pub.publish(
        'data',
        JSON.stringify({
            action: 'update',
            model: modelParser.modelsNames[model],
            data: { from: previous, to: inst.toJSON() }
        })
    );

    let result = await inst.save();

    result = await ctx.model.where({ id: result.id }).fetch({ withRelated });

    return embedFilter(embedFilters, [result.toJSON()])[0];
};
