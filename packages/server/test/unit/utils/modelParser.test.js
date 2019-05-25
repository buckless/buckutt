const test = require('ava');
const modelParser = require('server/app/utils/modelParser');
const { models } = require('server/app/db');

const req = {
    app: { locals: { models } }
};

const wrapModelParser = (tests, param) =>
    new Promise(resolve => {
        modelParser(
            req,
            null,
            err => {
                tests(err);
                resolve();
            },
            param
        );
    });

test('modelParser()', async t => {
    await wrapModelParser(err => t.is(undefined, err), 'alerts');
    await wrapModelParser(err => t.is(true, !!err), 'foo');
});
