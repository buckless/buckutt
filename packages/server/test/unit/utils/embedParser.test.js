const test = require('ava');

const { embedParser, embedFilter } = require('server/app/utils/embedParser');

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

test('embedFilter()', t => {
    const results = [{ foo: { id: 'ok' } }];
    const multipleResults = [{ foo: [{ id: 'ok' }] }];
    const emptyResults = [{ foo: null }];
    const multipleEmptyResults = [{ foo: [] }];

    t.deepEqual(results, embedFilter(['baz'], results));
    t.deepEqual(results, embedFilter(['foo'], results));
    t.deepEqual([], embedFilter(['foo'], emptyResults));
    t.deepEqual(multipleResults, embedFilter(['foo'], multipleResults));
    t.deepEqual(multipleResults, embedFilter(['baz'], multipleResults));
    t.deepEqual([], embedFilter(['foo'], multipleEmptyResults));
});

test('embedParser()', t => {
    const result = embedParser([
        'foo',
        { embed: 'foo.bar' },
        { embed: 'rel', filters: [['index', '=', '1']] }
    ]);

    t.is(3, result.length);
    t.is('foo', result[0]);
    t.is('foo.bar', result[1]);
    t.is('function', typeof result[2].rel);

    query.reset();

    const filter = result[2].rel(query);

    t.is(1, filter.list.length);
    t.is('index', filter.list[0].field);
    t.is('=', filter.list[0].op);
    t.is('1', filter.list[0].value);
});
