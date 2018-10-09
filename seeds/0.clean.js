const { event_id } = require('./utils/_data');

exports.seed = function (knex) {
    return knex('wikets').del()
        .then(() => knex('meansoflogin').del())
        .then(() => knex('rights').del())
        .then(() => knex('events')
            .where('id', event_id)
            .update({
                nfc_id: null,
                defaultGroup_id: null,
                defaultFundation_id: null,
                defaultPeriod_id: null
            })
        )
        .then(() => knex('articles').del())
        .then(() => knex('fundations').del())
        .then(() => knex('groups').del())
        .then(() => knex('users').del())
        .then(() => knex('points').del())
        .then(() => knex('meansofpayment').del())
        .then(() => knex('devices').del())
        .then(() => knex('periods').del())
        .then(() => knex('events').del());
};
