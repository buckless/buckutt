const faker = require('faker/locale/fr');
const uuid = require('uuid');
const computeUsername = require('../lib/username');

module.exports = ticketOrMail => {
    if (ticketOrMail === 'fail') {
        return Promise.resolve(null);
    }

    let firstname = faker.name.firstName();
    let lastname = faker.name.lastName();
    let username = computeUsername(firstname, lastname);

    /**
     * Mail is provided
     */
    if (ticketOrMail.indexOf('@') > -1) {
        return Promise.resolve({
            firstname: firstname,
            lastname: lastname,
            username: username,
            mail: ticketOrMail,
            credit: 500,
            ticketId: uuid()
        });
    }

    /**
     * Ticket is provided
     */
    return Promise.resolve({
        firstname: firstname,
        lastname: lastname,
        username: username,
        mail: faker.internet.email(),
        credit: 500,
        ticketId: ticketOrMail
    });
};
