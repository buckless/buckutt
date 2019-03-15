module.exports = bookshelf => {
    const name = 'Transaction';
    const Model = bookshelf.Model.extend({
        tableName: 'transactions',
        hasTimestamps: true,
        uuid: true,
        softDelete: true,

        wallet() {
            return this.belongsTo('Wallet');
        }
    });

    return { Model, name };
};
