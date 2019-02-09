const { item, point_id } = require('./utils/_data');

exports.seed = function(knex) {
    return knex('points').insert([item({ id: point_id, name: 'Internet' })]);
};
