module.exports = bookshelf => {
    const name = 'Wallet';
    const Model = bookshelf.Model.extend({
        tableName: 'wallets',
        hasTimestamps: true,
        uuid: true,
        softDelete: true,

        pendingCardUpdates() {
            return this.hasMany('PendingCardUpdate');
        },

        user() {
            return this.belongsTo('User');
        },

        memberships() {
            return this.hasMany('Membership');
        },

        ticket() {
            return this.hasOne('Ticket');
        }
    });

    return { Model, name };
};
