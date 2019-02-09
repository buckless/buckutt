module.exports = bookshelf => {
    const name = 'Alert';
    const Model = bookshelf.Model.extend({
        tableName: 'alerts',
        hasTimestamps: true,
        uuid: true,
        softDelete: true
    });

    return { Model, name };
};
