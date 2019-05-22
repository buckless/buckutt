const randomstring = require('randomstring');
const faker = require('faker/locale/fr');

module.exports = (name, opts = {}) => async ctx => {
    const firstname = faker.name.firstName();
    const lastname = faker.name.lastName();
    const mail = `${firstname}.${lastname}@gmail.com`;

    const now = new Date();

    const memberships = [
        ctx.factory.document({
            group_id: ctx.defaultGroup.id,
            period_id: ctx.defaultPeriod.id
        })
    ];

    const wallet = new ctx.factory.db.models.Wallet(
        ctx.factory.document({
            logical_id: opts.card ? randomstring.generate({ length: 15, charset: 'hex' }) : null,
            physical_id: opts.card ? randomstring.generate(5) : null,
            clientTime: now
        })
    );

    await wallet.save();

    for (let membership of memberships) {
        membership.wallet_id = wallet.id;

        const { id } = await new ctx.factory.db.models.Membership(membership).save();
        membership.id = id;
    }

    const data = wallet.toJSON();

    if (opts.card) {
        await new ctx.factory.db.models.PhysicalSupport(
            ctx.factory.document({
                logical_id: data.logical_id,
                physical_id: data.physical_id
            })
        ).save();
    }

    let ticket;
    if (opts.ticket) {
        ticket = new ctx.factory.db.models.Ticket(
            ctx.factory.document({
                logical_id: `ticket-${randomstring.generate(5)}`,
                physical_id: `ticket-${randomstring.generate(5)}`,
                wallet_id: wallet.id,
                firstname,
                lastname,
                mail
            })
        );

        await ticket.save();

        data.ticket = ticket.toJSON();

        ctx.factory.clears.push(
            ctx => new ctx.factory.db.models.Ticket({ id: ticket.id }).destroy({ hardDelete: true })
        );
    }

    ctx.factory.clears.push(
        ...memberships.map(m => ctx =>
            new ctx.factory.db.models.Membership({ id: m.id }).destroy({ hardDelete: true })
        ),
        ctx => new ctx.factory.db.models.Wallet({ id: wallet.id }).destroy({ hardDelete: true })
    );

    return { name, data };
};
