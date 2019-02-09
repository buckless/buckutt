const test = require('ava');
const pad2 = require('../../app/utils/pad2');

test('pad2', t => {
    t.is('01', pad2(1));
    t.is('0a', pad2('a'));
    t.is('12', pad2(12));
});
