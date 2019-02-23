const checkIfRelationshipExists = require('server/app/utils/checkIfRelationshipExists');

module.exports = async (ctx, { id, subId, submodel }) => {
    // get relationship data
    const relationship = checkIfRelationshipExists(ctx.model, submodel);

    // extract submodel class
    const SubModel = relationship.model;

    const left = await ctx.model.where({ id }).fetch({ require: true });
    const right = await SubModel.where({ id: subId }).fetch({ require: true });

    await left[submodel]().detach(right);
};
