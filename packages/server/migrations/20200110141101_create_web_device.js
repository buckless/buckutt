const uuidv4 = require('uuid/v4');
const { period_id, point_id, item } = require('../seeds/utils/_data');

exports.up = async function(knex) {
    const results = await knex('devices')
        .update({ deleted_at: new Date(), active: false })
        .where({ fingerprint: 'manager' })
        .orWhere({ fingerprint: 'admin' })
        .returning('id');

    if (results.length === 0) {
        return;
    }

    await Promise.all(
        Object.values(results).map(result =>
            knex('wikets')
                .update({ deleted_at: new Date(), active: false })
                .where({ device_id: result })
        )
    );

    const isWebDevice = await knex
        .count()
        .from('devices')
        .where({ fingerprint: 'web' })
        .then(c => c[0].count > 0);

    // If web has been already created
    if (isWebDevice) {
        const webDevice = await knex('devices')
            .returning('id')
            .update({ deleted_at: null, active: true })
            .where({ fingerprint: 'web' });

        return knex('wikets')
            .update({ deleted_at: null, active: true })
            .where({ device_id: webDevice[0] });
    }

    const webDevice = await knex('devices')
        .returning('id')
        .insert(
            item({
                id: uuidv4(),
                name: 'web',
                fingerprint: 'web'
            })
        );

    return knex('wikets').insert(
        item({
            id: uuidv4(),
            device_id: webDevice[0],
            point_id,
            period_id
        })
    );
};

exports.down = async function(knex) {
    const results = await knex('devices')
        .update({ deleted_at: null, active: true })
        .where({ fingerprint: 'manager' })
        .orWhere({ fingerprint: 'admin' })
        .returning('id');

    if (results.length === 0) {
        return;
    }

    await Promise.all(
        Object.values(results).map(result =>
            knex('wikets')
                .update({ deleted_at: null, active: true })
                .where({ device_id: result })
        )
    );

    const webDevice = await knex('devices')
        .returning('id')
        .update({ deleted_at: new Date(), active: false })
        .where({ fingerprint: 'web' });

    return knex('wikets')
        .update({ deleted_at: new Date(), active: false })
        .where({ device_id: webDevice[0] });
};
