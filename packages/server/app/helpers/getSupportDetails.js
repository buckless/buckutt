module.exports = async (ctx, condition) => {
    let physicalSupport = ctx.models.PhysicalSupport;

    if (condition.logical_id) {
        physicalSupport = physicalSupport.where({ logical_id: condition.logical_id });
    } else if (condition.physical_id) {
        physicalSupport = physicalSupport.where({ physical_id: condition.physical_id });
    } else {
        return {};
    }

    await physicalSupport.fetch();

    if (physicalSupport.get('logical_id')) {
        return {
            logical_id: physicalSupport.get('logical_id'),
            physical_id: physicalSupport.get('physical_id')
        };
    } else if (condition.logical_id) {
        return { logical_id: condition.logical_id };
    }

    return {};
};
