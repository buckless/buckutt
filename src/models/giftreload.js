module.exports = (bookshelf) => {
    const name = 'GiftReload';
    const Model = bookshelf.Model.extend({
        tableName    : 'giftreloads',
        hasTimestamps: true,
        uuid         : true,
        softDelete   : true,
    });

    return { Model, name };
};
