const test = require('ava');
const { factory, device, clear } = require('../utils/factory');
const { registerDevice, checkDevice } = require('server/app/actions/auth/checkDevice');

test.before(t =>
    factory(
        t,
        device('unauthorized'),
        device('authorized', { authorized: true }),
        device('sendPrivateKey', { authorized: true, sendPrivateKey: true })
    )
);

test('register a new device at the first request', async t => {
    const result = await registerDevice(t.context.ctx, 'NEWFRINGERPRINT');

    t.is(result.authorized, false);
    t.truthy(result.name);

    await t.context.factory.db.models.Device.where(result).destroy({ hardDelete: true });

    t.pass();
});

test('deny if the device already exists', async t => {
    const { fingerprint } = t.context.unauthorized;
    const error = await t.throwsAsync(registerDevice(t.context.ctx, fingerprint));

    t.is(error.message, 'Unauthorized device');
    t.pass();
});

test('deny if the device is not provided', async t => {
    const error = await t.throwsAsync(checkDevice(t.context.ctx));

    t.is(error.message, 'Device not found');
    t.pass();
});

test('returns unauthorized only is the device is unauthorized', async t => {
    const result = await checkDevice(t.context.ctx, t.context.unauthorized);

    t.false(result.authorized);
    t.is(result.name, t.context.unauthorized.name);
    t.falsy(result.newPrivateKey);
    t.falsy(result.config);

    t.pass();
});

test('returns authorized only is the device is authorized without sendPrivateKey', async t => {
    const result = await checkDevice(t.context.ctx, t.context.authorized);

    t.true(result.authorized);
    t.is(result.name, t.context.authorized.name);
    t.falsy(result.newPrivateKey);
    t.falsy(result.config);

    t.pass();
});

test('regen the private key and send it if the device is authorized with sendPrivateKey', async t => {
    const result = await checkDevice(t.context.ctx, t.context.sendPrivateKey);

    t.true(result.authorized);
    t.is(result.name, t.context.sendPrivateKey.name);
    t.truthy(result.newPrivateKey);
    t.not(result.newPrivateKey, t.context.sendPrivateKey.privateKey);

    t.pass();
});

test.after.always(t => clear(t));
