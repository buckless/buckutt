const test = require('ava');
const axios = require('../utils/axios');
const app = require('server/app');

test('start the test application', async t => {
    await app();

    const res = await axios.get('/');

    t.is(res.status, 200);

    t.pass();
});
