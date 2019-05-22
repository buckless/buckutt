const randomstring = require('randomstring');
const faker = require('faker/locale/fr');

module.exports = (name, opts = {}) => async ctx => {
    const firstname = faker.name.firstName();
    const lastname = faker.name.lastName();
    const mail = `${firstname}.${lastname}@gmail.com`;

    const ticket = new ctx.factory.db.models.Ticket(
        ctx.factory.document({
            logical_id: `ticket-${randomstring.generate(5)}`,
            physical_id: `ticket-${randomstring.generate(5)}`,
            firstname,
            lastname,
            mail
        })
    );

    await ticket.save();

    const data = ticket.toJSON();

    ctx.factory.clears.push(
        ctx => new ctx.factory.db.models.Ticket({ id: ticket.id }).destroy({ hardDelete: true })
    );

    return { name, data };
};
