const name = 'meansoflogin_type_data_active_unique';

exports.up = function (knex) {

    return knex.schema
        .table('meansoflogin', (t) => {
            t.dropUnique(['type', 'data', 'active']);
        }).then(() =>
            knex.raw(`CREATE UNIQUE INDEX ${name} ON meansoflogin (type, data, active) WHERE type != 'mail'`)
        )
};

exports.down = function (knex) {
    return knex.raw(`DROP INDEX "public"."${name}";`)
        .then(() =>
            knex.schema
            .table('meansoflogin', (t) => {
                t.unique(['type', 'data', 'active']);
            })
        )
};
