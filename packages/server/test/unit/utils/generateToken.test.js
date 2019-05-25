const test = require('ava');
const jwt = require('jsonwebtoken');
const config = require('server/app/config');
const generateToken = require('server/app/utils/generateToken');

test('generateToken()', async t => {
    const token = generateToken({ foo: 'bar' });

    let body = token.split('.')[1];
    body = new Buffer(body, 'base64').toString('utf8');
    body = JSON.parse(body);

    t.is('bar', body.foo);

    const decoded = jwt.verify(token, config.app.secret);

    t.is('bar', decoded.foo);
});
