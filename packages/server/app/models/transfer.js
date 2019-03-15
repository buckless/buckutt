module.exports = bookshelf => {
    const name = 'Transfer';
    const Model = bookshelf.Model.extend({
        tableName: 'transfers',
        hasTimestamps: true,
        uuid: true,
        softDelete: true,

        debitor() {
            return this.belongsTo('Wallet', 'debitor_id');
        },

        creditor() {
            return this.belongsTo('Wallet', 'creditor_id');
        }
    });

    return { Model, name };
};
