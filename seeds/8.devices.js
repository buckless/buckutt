const uuid = require('uuid').v4;

const { admin_id, manager_id, point_id, period_id, item } = require('./utils/_data');

exports.seed = function (knex) {
    return knex('devices').del()
        .then(() =>
            knex('devices').insert([
                item({ id: admin_id, name: 'admin', fingerprint: 'admin' }),
                item({ id: manager_id, name: 'manager', fingerprint: 'manager' })
            ])
        )
        .then(() => knex('wikets').del())
        .then(() =>
            knex('wikets').insert([
                item({ id: uuid(), device_id: admin_id, point_id, period_id  }),
                item({ id: uuid(), device_id: manager_id, point_id, period_id  })
            ])
        )
};
