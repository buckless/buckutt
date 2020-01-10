const { pick } = require('lodash');

module.exports = async ctx => ({
    event: pick(ctx.event, [
        'name',
        'activateManager',
        'allowRegistration',
        'showInvoice',
        'allowCardLinking',
        'allowTicketLinking',
        'showQrCode'
    ]),

    style: {
        'grey-50': ctx.event.grey50,
        'grey-600': ctx.event.grey600,
        black: ctx.event.black,
        'primary-300': ctx.event.primary300,
        'foreground-dark-100': ctx.event.foregroundDark100,
        'foreground-dark-200': ctx.event.foregroundDark200,
        'foreground-dark-300': ctx.event.foregroundDark300,
        'accent-300': ctx.event.accent300
    }
});
