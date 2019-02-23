const modelParser = require('server/app/utils/modelParser');

module.exports = async (ctx, id) => {
    const inst = await new ctx.model({ id }).destroy();

    ctx.pub.publish(
        'data',
        JSON.stringify({
            action: 'delete',
            model: modelParser.modelsNames[ctx.params.model],
            data: { from: inst, to: null }
        })
    );
};
