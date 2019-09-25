const randomstring = require('randomstring');
const faker = require('faker/locale/fr');

module.exports = (name, opts = {}) => async ctx => {
    // get ctx.factory.db
    // create user
    // create memberships
    // create ...
    // register DELETE commands on ctx.clears
    const firstname = faker.name.firstName();
    const lastname = faker.name.lastName();
    const mail = faker.internet.email().toLowerCase();

    const now = new Date();

    const memberships = [
        ctx.factory.document({
            group_id: ctx.defaultGroup.id,
            period_id: ctx.defaultPeriod.id
        })
    ];

    const user = new ctx.factory.db.models.User(
        ctx.factory.document({
            firstname,
            lastname,
            // 1234
            pin: '$2y$10$fu/BM5Y7ktitbqkPuBYz6OKPB3ge5AsZGD5wLP6nBN0VnbxLW80UK',
            // abcd
            password: '$2y$10$0X3NPBy62Ipg1DKslJPIP.4Q9XY03dPTLvat0iLvS7KbaPQa4tLHK',
            mail,
            clientTime: now
        })
    );

    await user.save();

    const wallet = new ctx.factory.db.models.Wallet(
        ctx.factory.document({
            logical_id: opts.card ? randomstring.generate({ length: 15, charset: 'hex' }) : null,
            physical_id: opts.card ? randomstring.generate(5) : null,
            user_id: user.id,
            clientTime: now
        })
    );

    await wallet.save();

    for (let membership of memberships) {
        membership.user_id = user.id;

        const { id } = await new ctx.factory.db.models.Membership(membership).save();
        membership.id = id;
    }

    const data = user.toJSON();
    data.wallets = [wallet.toJSON()];

    if (opts.card) {
        await new ctx.factory.db.models.PhysicalSupport(
            ctx.factory.document({
                logical_id: data.wallets[0].logical_id,
                physical_id: data.wallets[0].physical_id
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

        data.wallets[0].ticket = ticket.toJSON();

        ctx.factory.clears.push(ctx =>
            new ctx.factory.db.models.Ticket({ id: ticket.id }).destroy({ hardDelete: true })
        );
    }

    ctx.factory.clears.push(
        ...memberships.map(m => ctx =>
            new ctx.factory.db.models.Membership({ id: m.id }).destroy({ hardDelete: true })
        ),
        ctx => new ctx.factory.db.models.Wallet({ id: wallet.id }).destroy({ hardDelete: true }),
        ctx => new ctx.factory.db.models.User({ id: user.id }).destroy({ hardDelete: true })
    );

    return { name, data };
};
