module.exports = bookshelf => {
    const name = 'PendingCardUpdate';
    const Model = bookshelf.Model.extend({
        tableName: 'pendingCardUpdates',
        hasTimestamps: true,
        uuid: true,
        softDelete: true,

        wallet() {
            return this.belongsTo('Wallet');
        }
    });

    return { Model, name };
};
