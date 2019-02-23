const faker = require('faker/locale/fr');
const computeUsername = require('server/app/helpers/username');

module.exports = async () => {
    let firstname = faker.name.firstName();
    let lastname = faker.name.lastName();
    let username = await computeUsername(firstname, lastname);

    return [
        {
            firstname: firstname,
            lastname: lastname,
            username: username,
            mail: 'test@mail.com',
            credit: 500,
            ticketId: '1234'
        }
    ];
};
