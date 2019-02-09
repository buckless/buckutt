module.exports = bookshelf => {
    const name = 'Access';
    const Model = bookshelf.Model.extend({
        tableName: 'accesses',
        hasTimestamps: true,
        uuid: true,
        softDelete: true,

        meanOfLogin() {
            return this.belongsTo('MeanOfLogin', 'meanOfLogin_id');
        },

        operator() {
            return this.belongsTo('User', 'operator_id');
        },

        wiket() {
            return this.belongsTo('Wiket');
        }
    });

    return { Model, name };
};
