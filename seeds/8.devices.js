const { admin_id, manager_id, item } = require('./utils/_data');

exports.seed = function (knex) {
    return knex('devices').del()
        .then(() =>
            knex('devices').insert([
                item({ id: admin_id, name: 'admin', fingerprint: 'admin', isUser: true }),
                item({ id: manager_id, name: 'manager', fingerprint: 'manager', isUser: true })
            ])
        );
};
