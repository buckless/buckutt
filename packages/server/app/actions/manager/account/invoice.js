const moment = require('moment');

const nextInvoiceNumber = lastInvoiceNumber => {
    const next = (parseInt(lastInvoiceNumber, 10) + 1).toString();

    const length = Math.max(4, next.length);

    return next.padStart(length, '0');
};

module.exports = async ctx => {
    const date = moment().format('YYYY-MM');

    const lastInvoice = await ctx.models.InvoiceNumber.orderBy('created_at', 'desc')
        .where('created_at', '>=', `${date}-01`)
        .fetch()
        .then(invoice => invoice && invoice.toJSON());

    const invoiceNumber = lastInvoice
        ? nextInvoiceNumber(lastInvoice.invoiceNumber)
        : nextInvoiceNumber('0');

    const newLastInvoice = new ctx.models.InvoiceNumber({ invoiceNumber });

    await newLastInvoice.save();

    return `${date}-${invoiceNumber}`;
};
