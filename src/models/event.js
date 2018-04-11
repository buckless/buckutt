module.exports = bookshelf => {
    const name = 'Event';
    const Model = bookshelf.Model.extend({
        tableName: 'events',
        hasTimestamps: true,
        uuid: true,
        softDelete: true,

        defaultGroup() {
            return this.belongsTo('Group', 'defaultGroup_id');
        },

        defaultFundation() {
            return this.belongsTo('Fundation', 'defaultFundation_id');
        },

        defaultPeriod() {
            return this.belongsTo('Period', 'defaultPeriod_id');
        }
    });

    return { Model, name };
};
