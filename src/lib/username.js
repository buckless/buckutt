const { transliterate } = require('transliteration');
const { models } = require('./lib/bookshelf');

function concat(firstname, lastname) {
    firstname = transliterate(firstname).replace(/[\u0250-\ue007]/g, '').toLowerCase();
    lastname = transliterate(lastname).replace(/[\u0250-\ue007]/g, '').toLowerCase();

    return firstname.slice(0, 1) + lastname;
}

module.exports = (firstname, lastname) => {
    const username = concat(firstname, lastname);

    return models.MeanOfLogin
        .where({
            type: 'username',
            data: username,
            blocked: false
        })
        .count()
        .then((count) => {
            return (count === 1)
                ? username
                : username + (count - 1)
        });
};
