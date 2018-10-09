const { event_id, nfc_id, item } = require('./utils/_data');

exports.seed = function (knex) {
    return knex('articles').insert([
            item({
                id   : nfc_id,
                name : 'Support NFC'
            })
        ])
        .then(() =>
            knex('events')
                .where('id', event_id)
                .update({
                    nfc_id
                })
        );
};
