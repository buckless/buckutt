const { event_id, group_id, item } = require('./utils/_data');

exports.seed = function (knex) {
    return knex('groups').insert([
            item({
                id   : group_id,
                name : 'Défaut'
            })
        ])
        .then(() =>
            knex('events')
                .where('id', event_id)
                .update({
                    defaultGroup_id: group_id
                })
        );
};
