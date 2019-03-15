module.exports = bookshelf => {
    const name = 'Withdrawal';
    const Model = bookshelf.Model.extend({
        tableName: 'withdrawals',
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
