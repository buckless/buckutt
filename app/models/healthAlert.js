module.exports = bookshelf => {
    const name = 'HealthAlert';
    const Model = bookshelf.Model.extend({
        tableName: 'healthAlerts',
        hasTimestamps: true,
        uuid: true,
        softDelete: true
    });

    return { Model, name };
};
