const randomstring = require('randomstring');

module.exports = (name, opts = {}) => async ctx => {
    const device = await new ctx.factory.db.models.Device(
        ctx.factory.document({
            name: randomstring.generate({ length: 6 }),
            fingerprint: randomstring.generate({ length: 15, charset: 'hex' }),
            privateKey: randomstring.generate({ length: 15, charset: 'hex' }),
            sendPrivateKey: opts.sendPrivateKey || false,
            authorized: opts.authorized || false
        })
    );

    await device.save();

    const data = device.toJSON();

    ctx.factory.clears.push(ctx =>
        new ctx.factory.db.models.Device({ id: device.id }).destroy({ hardDelete: true })
    );

    return { name, data };
};
