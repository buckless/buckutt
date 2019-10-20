module.exports = bookshelf => {
    const name = 'Coupon';
    const Model = bookshelf.Model.extend({
        tableName: 'coupons',
        hasTimestamps: true,
        uuid: true,
        softDelete: true,

        couponSet() {
            return this.belongsTo('Set', 'set_id');
        }
    });

    return { Model, name };
};
