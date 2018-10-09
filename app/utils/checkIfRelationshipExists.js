const APIError = require('@/utils/APIError');

module.exports = (model, submodel) => {
    const forged = model();

    if (!forged[submodel]) {
        throw new APIError(module, 404, 'Document not found: submodel does not exist', {
            submodel
        });
    }

    return forged[submodel]();
};
