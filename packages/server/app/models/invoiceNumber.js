module.exports = bookshelf => {
    const name = 'InvoiceNumber';
    const Model = bookshelf.Model.extend({
        tableName: 'invoiceNumbers',
        hasTimestamps: true,
        uuid: true,
        softDelete: true
    });

    return { Model, name };
};
