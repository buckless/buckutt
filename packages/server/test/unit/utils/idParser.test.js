const test = require('ava');
const uuid = require('uuid');
const id = require('server/app/utils/idParser');
const { isUUID } = id;

const wrapId = (tests, param) =>
    new Promise(resolve => {
        id(
            null,
            null,
            err => {
                tests(err);
                resolve();
            },
            param
        );
    });

test('id()', async t => {
    await wrapId(err => t.is(undefined, err), 'search');
    await wrapId(err => t.is(undefined, err), uuid.v4());
    await wrapId(err => t.is(true, !!err), 'foo');
    await wrapId(err => t.is(true, !!err), null);
    await wrapId(err => t.is(true, !!err));
});

test('isUUID()', t => {
    t.is(true, isUUID(uuid.v4()));
    t.is(false, isUUID('foo'));
});
