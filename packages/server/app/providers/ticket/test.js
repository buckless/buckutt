const faker = require('faker/locale/fr');

module.exports = async function test() {
    let firstname = faker.name.firstName();
    let lastname = faker.name.lastName();

    return [
        {
            firstname,
            lastname,
            mail: 'test@mail.com',
            amount: 500,
            logical_id: '1234',
            physical_id: 'TK1234'
        }
    ];
};
