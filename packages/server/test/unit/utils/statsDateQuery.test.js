const test = require('ava');
const statsDateQuery = require('server/app/utils/statsDateQuery');

const query = {
    list: [],
    reset() {
        query.list = [];
    },
    where(field, op, value) {
        query.list.push({ field, op, value });
        return query;
    }
};

test('statsDateQuery()', t => {
    const d = new Date();

    query.reset();
    statsDateQuery(query, d, d);

    t.is(query.list[0].field, 'clientTime');
    t.is(query.list[0].op, '>=');
    t.is(query.list[0].value.getTime(), d.getTime());

    t.is(query.list[1].field, 'clientTime');
    t.is(query.list[1].op, '<=');
    t.is(query.list[1].value.getTime(), d.getTime());
});
