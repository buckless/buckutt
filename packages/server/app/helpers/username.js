const { transliterate } = require('transliteration');
const { knex } = require('@/db');

const concat = (firstname, lastname) => {
    firstname = transliterate(firstname)
        .replace(/[\u0250-\ue007]/g, '')
        .replace(/\s/g, '')
        .toLowerCase();
    lastname = transliterate(lastname)
        .replace(/[\u0250-\ue007]/g, '')
        .replace(/\s/g, '')
        .toLowerCase();

    return firstname.slice(0, 1) + lastname;
};

module.exports = async (firstname, lastname) => {
    const username = concat(firstname, lastname);

    const res = await knex.raw(
        `
            select count(1)
            from meansoflogin
            where type = 'username'
            and blocked = false
            and data similar to ?
        `,
        [`${username}[0123456789]*`]
    );

    const count = parseInt(res.rows[0].count, 10);

    return count === 0 ? username : username + count;
};
