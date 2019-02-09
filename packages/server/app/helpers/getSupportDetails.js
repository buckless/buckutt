module.exports = async (ctx, condition) => {
    const requestCondition = {};

    if (condition.logical_id) {
        requestCondition.logical_id = condition.logical_id;
    }

    if (condition.physical_id) {
        requestCondition.physical_id = condition.physical_id;
    }

    const physicalSupport = await ctx.models.PhysicalSupport.where(requestCondition).fetch();

    if (physicalSupport) {
        return physicalSupport.toJSON();
    }

    if (condition.logical_id) {
        return { logical_id: condition.logical_id };
    }
};
