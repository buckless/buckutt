module.exports = (bookshelf) => {
    const name = 'Access';
    const Model = bookshelf.Model.extend({
        tableName    : 'accessess',
        hasTimestamps: true,
        uuid         : true,
        softDelete   : true,

        meanOfLogin() {
            return this.belongsTo('MeanOfLogin');
        },

        operator() {
            return this.belongsTo('User');
        },

        wiket() {
            return this.belongsTo('Wiket');
        }
    });

    return { Model, name };
};
