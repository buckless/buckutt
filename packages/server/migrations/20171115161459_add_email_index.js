exports.up = function(knex) {
    return knex
        .raw('CREATE INDEX meansoflogin_lower_case_data_index ON meansoflogin(lower(data))')
        .then(() => knex.raw('CREATE INDEX users_lower_case_mail_index ON users(lower(mail))'));
};

exports.down = function(knex) {
    return knex.schema
        .table('meansoflogin', t => {
            t.dropIndex('lower_case_data');
        })
        .table('users', t => {
            t.dropIndex('lower_case_mail');
        });
};
