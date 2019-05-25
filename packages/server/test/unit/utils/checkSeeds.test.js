const test = require('ava');
const checkSeeds = require('server/app/utils/checkSeeds');
const { Device } = require('server/app/db').models;

test('checkSeeds', async t => {
    t.is(true, await checkSeeds({ models: { Device } }));
});
