module.exports = function getSupportDetails(models, condition) {
    let request = models.PhysicalSupport;
    if (condition.logical_id && condition.physical_id) {
        request = request
            .where({ logical_id: condition.logical_id })
            .orWhere({ physical_id: condition.physical_id })
    } else if (condition.physical_id) {
        request = request.where({ physical_id: condition.physical_id })
    } else if (condition.logical_id) {
        request = request.where({ logical_id: condition.logical_id })
    }

    return request
        .fetch()
        .then(physicalSupport => {
            if (physicalSupport) {
                return physicalSupport.toJSON();
            }

            if (condition.logical_id) {
                return {
                    logical_id: condition.logical_id
                };
            }
        });
};
