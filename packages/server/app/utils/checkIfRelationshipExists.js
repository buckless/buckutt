const APIError = require('server/app/utils/APIError');

module.exports = (Model, submodel) => {
    const forged = new Model();

    if (!forged[submodel]) {
        throw new APIError(module, 404, 'Document not found: submodel does not exist', {
            submodel
        });
    }

    return forged[submodel]();
};
