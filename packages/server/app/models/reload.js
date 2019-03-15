module.exports = bookshelf => {
    const name = 'Reload';
    const Model = bookshelf.Model.extend({
        tableName: 'reloads',
        hasTimestamps: true,
        uuid: true,
        softDelete: true,

        point() {
            return this.belongsTo('Point');
        },

        wallet() {
            return this.belongsTo('Wallet');
        },

        seller() {
            return this.belongsTo('User', 'seller_id');
        }
    });

    return { Model, name };
};
