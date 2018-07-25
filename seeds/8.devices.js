const uuid = require('uuid').v4;

exports.seed = function (knex) {
    return knex('devices').del()
        .then(() =>
            knex('devices').insert([
                item({ id: uuid(), name: 'admin', fingerprint: 'admin', isUser: true }),
                item({ id: uuid(), name: 'manager', name: 'manager', isUser: true })
            ])
        );
};
