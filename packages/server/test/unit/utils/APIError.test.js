const test = require('ava');
const APIError = require('server/app/utils/APIError');

const nativeErr = new Error();
const err = new APIError(module, 500, 'Error message', { foo: 'bar' });
const err2 = new APIError(module, 500, 'Error message', nativeErr);

test('APIError.constructor()', t => {
    t.is(true, err instanceof Error);
    t.is(true, err instanceof APIError);
    t.is(module, err.module);
    t.is('Error message', err.message);
    t.is(500, err.status);
    t.is('bar', err.details.foo);
    t.is(nativeErr.stack, err2.details);
});

test('APIError.toJSON()', t => {
    t.is(500, err.toJSON().status);
    t.is('Error message', err.toJSON().message);
});
