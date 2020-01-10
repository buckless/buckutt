const test = require('ava');
const { factory, user, clear } = require('../utils/factory');
const { login } = require('server/app/actions/auth/login');

test.before(t => factory(t, user('testUser', { card: true })));

test('login with mail and password', async t => {
    const { mail } = t.context.testUser;
    const result = await login(t.context.ctx, {
        infos: { connectType: 'password', mail },
        password: 'abcd'
    });

    t.truthy(result.user);
    t.truthy(result.token);
    t.pass();
});

test('login with card number and password', async t => {
    const { mail, wallets } = t.context.testUser;

    const result = await login(t.context.ctx, {
        infos: { connectType: 'password', wallet: wallets[0].logical_id },
        password: 'abcd'
    });

    t.truthy(result.user);
    t.truthy(result.token);
    t.pass();
});

test('deny if login with mail and pin in web mode', async t => {
    const { mail } = t.context.testUser;

    const error = await t.throwsAsync(
        login(t.context.ctx, {
            infos: { connectType: 'pin', mail },
            pin: 1234
        })
    );

    t.is(error.message, 'Login error: Wrong credentials');
    t.pass();
});

test('deny if login with card number and pin in web mode', async t => {
    const { mail, wallets } = t.context.testUser;

    const error = await t.throwsAsync(
        login(t.context.ctx, {
            infos: { connectType: 'pin', wallet: wallets[0].logical_id },
            pin: 1234
        })
    );

    t.is(error.message, 'Login error: Wrong credentials');
    t.pass();
});

test('deny if connect type is missing', async t => {
    const { mail, wallets } = t.context.testUser;
    const error = await t.throwsAsync(
        login(t.context.ctx, { infos: { wallet: wallets[0].logical_id }, password: 'abcd' })
    );

    t.is(error.message, 'Login error: Wrong credentials');
    t.pass();
});

test('deny if password is wrong', async t => {
    const { mail } = t.context.testUser;
    const error = await t.throwsAsync(
        login(t.context.ctx, {
            infos: { connectType: 'password', mail },
            password: 'abce'
        })
    );

    t.is(error.message, 'Login error: Wrong credentials');
    t.pass();
});

test('deny if password is missing', async t => {
    const { mail } = t.context.testUser;
    const error = await t.throwsAsync(
        login(t.context.ctx, { infos: { connectType: 'password', mail } })
    );

    t.is(error.message, 'Login error: Wrong credentials');
    t.pass();
});

test('deny if mail is not found', async t => {
    const error = await t.throwsAsync(
        login(t.context.ctx, {
            infos: { connectType: 'password', mail: 'fake@buckless.com' },
            password: 'abcd'
        })
    );

    t.is(error.message, 'Login error: Wrong credentials');
    t.pass();
});

test('deny if card number is not found', async t => {
    const error = await t.throwsAsync(
        login(t.context.ctx, {
            infos: { connectType: 'password', wallet: 'fake' },
            password: 'abcd'
        })
    );

    t.is(error.message, 'Login error: Wrong credentials');
    t.pass();
});

// TODO: to move in device mode
// test('deny if pin is wrong', async t => {
//     const { mail } = t.context.testUser;
//     const error = await t.throwsAsync(
//         login(t.context.ctx, { infos: { connectType: 'pin', mail }, pin: 1235 })
//     );
//
//     t.is(error.message, 'Login error: Wrong credentials');
//     t.pass();
// });
//
// test('deny if pin is missing', async t => {
//     const { mail } = t.context.testUser;
//     const error = await t.throwsAsync(
//         login(t.context.ctx, { infos: { connectType: 'pin', mail } })
//     );
//
//     t.is(error.message, 'Login error: Wrong credentials');
//     t.pass();
// });

test.after.always(t => clear(t));
