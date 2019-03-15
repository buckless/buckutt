module.exports = bookshelf => {
    const name = 'Ticket';
    const Model = bookshelf.Model.extend({
        tableName: 'tickets',
        hasTimestamps: true,
        uuid: true,
        softDelete: true,

        wallet() {
            return this.belongsTo('Wallet');
        }
    });

    return { Model, name };
};
