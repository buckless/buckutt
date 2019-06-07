module.exports = bookshelf => {
    const name = 'Refund';
    const Model = bookshelf.Model.extend({
        tableName: 'refunds',
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
