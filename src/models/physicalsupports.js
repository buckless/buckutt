module.exports = bookshelf => {
    const name = 'PhysicalSupport';
    const Model = bookshelf.Model.extend({
        tableName: 'physicalsupports',
        hasTimestamps: true,
        uuid: true,
        softDelete: true
    });

    return { Model, name };
};
