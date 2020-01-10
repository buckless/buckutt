const uuid = require('uuid').v4;

const { web_id, point_id, period_id, item } = require('./utils/_data');

exports.seed = function(knex) {
    return knex('devices')
        .insert([
            item({
                id: web_id,
                name: 'web',
                fingerprint: 'web'
            })
        ])
        .then(() => knex('wikets').del())
        .then(() =>
            knex('wikets').insert([item({ id: uuid(), device_id: web_id, point_id, period_id })])
        );
};
