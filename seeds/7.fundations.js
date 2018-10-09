const { event_id, fundation_id, item } = require('./utils/_data');

exports.seed = function (knex) {
    return knex('fundations').insert([
            item({
                id   : fundation_id,
                name : 'Défaut'
            })
        ])
        .then(() =>
            knex('events')
                .where('id', event_id)
                .update({
                    defaultFundation_id: fundation_id
                })
        );
};
