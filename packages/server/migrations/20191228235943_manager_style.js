exports.up = function(knex) {
    return knex.schema.table('events', t => {
        t.string('grey50')
            .notNullable()
            .defaultTo('#fff');
        t.string('grey600')
            .notNullable()
            .defaultTo('#e3e3e4');
        t.string('black')
            .notNullable()
            .defaultTo('#0a0d15');
        t.string('primary300')
            .notNullable()
            .defaultTo('#708cea');
        t.string('foregroundDark100')
            .notNullable()
            .defaultTo('rgba(0,0,0,.50)');
        t.string('foregroundDark200')
            .notNullable()
            .defaultTo('rgba(0,0,0,.71)');
        t.string('foregroundDark300')
            .notNullable()
            .defaultTo('rgba(0,0,0,.87)');
        t.string('accent300')
            .notNullable()
            .defaultTo('#47e09b');
    });
};

exports.down = function(knex) {
    return knex.schema.table('events', t => {
        t.dropColumn('grey50');
        t.dropColumn('grey600');
        t.dropColumn('black');
        t.dropColumn('primary300');
        t.dropColumn('foregroundDark100');
        t.dropColumn('foregroundDark200');
        t.dropColumn('foregroundDark300');
        t.dropColumn('accent300');
    });
};
