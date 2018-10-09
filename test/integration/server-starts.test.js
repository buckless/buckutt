const test = require('ava');
const axios = require('../utils/axios');
const app = require('../../app');

const sleep = function (duration) {
    return function () {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve();
            }, duration)
        });
    };
}

test('start the test application', async t => {
    await app();

    const res = await axios.get('/');

    t.is(res.status, 200)

    t.pass();
});
