exports.up = function(knex) {
    return knex.schema.table('devices', (t) => {
        t.string('privateKey');
        t.boolean('sendPrivateKey').notNullable().defaultTo(false);
        t.boolean('authorized').notNullable().defaultTo(false);
    });
};

exports.down = function(knex) {
    return knex.schema.table('devices', (t) => {
        t.dropColumn('privateKey');
        t.dropColumn('sendPrivateKey');
        t.dropColumn('authorized');
    });
};
