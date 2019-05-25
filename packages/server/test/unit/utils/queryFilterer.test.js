const test = require('ava');
const queryFilterer = require('server/app/utils/queryFilterer');

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

test('queryFilterer()', t => {
    query.reset();

    queryFilterer(query, [{ field: 'foo', gt: 1 }]);

    t.is('foo', query.list[0].field);
    t.is('>', query.list[0].op);
    t.is(1, query.list[0].value);
});
