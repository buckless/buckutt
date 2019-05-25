const test = require('ava');
const sanitizeUser = require('server/app/utils/sanitizeUser');

const oneDay = 1000 * 60 * 60 * 24;

const user = {
    firstname: 'Foo',
    lastname: 'Bar',
    pin: '123',
    password: 'abc',
    rights: [
        {
            point_id: 'foo',
            name: 'seller',
            period: { start: Date.now() - oneDay, end: Date.now() + oneDay }
        },
        {
            point_id: 'foo',
            name: 'controller',
            period: { start: Date.now() - oneDay, end: Date.now() + oneDay }
        }
    ]
}

test('sanitizeUser()', t => {
    const u = sanitizeUser(user, 'foo');

    t.is('', u.pin);
    t.is('', u.password);
    t.is(true, u.canSell);
    t.is(true, u.canControl);
    t.is(false, u.canReload);
});
