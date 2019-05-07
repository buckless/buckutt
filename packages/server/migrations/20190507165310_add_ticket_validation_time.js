exports.up = function(knex) {
    return knex.schema
        .table('tickets', t => {
            t.dateTime('validation').nullable();
        });
};

exports.down = function(knex) {
    return knex.schema
        .table('tickets', t => {
            t.dropColumn('validation');
        });
};
