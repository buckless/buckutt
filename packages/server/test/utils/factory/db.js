const db = require('server/app/db');

module.exports = async ctx => {
    await db.ready();

    ctx.event = (await db.models.Event.where({ name: 'Défaut' }).fetch()).toJSON();
    ctx.defaultGroup = (await db.models.Group.where({ name: 'Défaut' }).fetch()).toJSON();
    ctx.defaultPeriod = (await db.models.Period.where({ name: 'Défaut' }).fetch()).toJSON();

    const webDevice = await db.models.Device.where({ name: 'web' }).fetch();
    ctx.webWiket = (await db.models.Wiket.where({ device_id: webDevice.get('id') }).fetch({
        withRelated: ['device', 'point']
    })).toJSON();

    return db;
};
