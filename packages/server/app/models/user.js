module.exports = bookshelf => {
    const name = 'User';
    const Model = bookshelf.Model.extend({
        tableName: 'users',
        hasTimestamps: true,
        uuid: true,
        softDelete: true,

        wallets() {
            return this.hasMany('Wallet');
        },

        memberships() {
            return this.hasMany('Membership');
        },

        rights() {
            return this.hasMany('Right');
        }
    });

    return { Model, name };
};
