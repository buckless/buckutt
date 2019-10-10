module.exports = bookshelf => {
    const name = 'FailedRequest';
    const Model = bookshelf.Model.extend({
        tableName: 'failedRequests',
        hasTimestamps: true,
        uuid: true,
        softDelete: true
    });

    return { Model, name };
};
