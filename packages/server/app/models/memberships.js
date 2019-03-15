module.exports = bookshelf => {
    const name = 'Membership';
    const Model = bookshelf.Model.extend({
        tableName: 'memberships',
        hasTimestamps: true,
        uuid: true,
        softDelete: true,

        user() {
            return this.belongsTo('User');
        },

        wallet() {
            return this.belongsTo('Wallet');
        },

        group() {
            return this.belongsTo('Group');
        },

        period() {
            return this.belongsTo('Period');
        }
    });

    return { Model, name };
};
