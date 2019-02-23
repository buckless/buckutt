const checkIfRelationshipExists = require('server/app/utils/checkIfRelationshipExists');

module.exports = async (ctx, { submodel, id, subId }) => {
    // get relationship data
    const relationship = checkIfRelationshipExists(ctx.model, submodel);

    // extract submodel class
    const subModel = relationship.model;

    const left = await ctx.model.where({ id }).fetch({ require: true });
    const right = await subModel.where({ id: subId }).fetch({ require: true });

    await left[submodel]().attach(right);
};
