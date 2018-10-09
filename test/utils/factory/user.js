const uuid = require('uuid');
const randomstring = require('randomstring');
const faker = require('faker/locale/fr');
const computeUsername = require('@/helpers/username');

module.exports = (name, opts) => async ctx => {
    // get ctx.factory.db
    // create user
    // create memberships
    // create ...
    // register DELETE commands on ctx.clears
    let firstname = faker.name.firstName();
    let lastname = faker.name.lastName();
    let username = await computeUsername(firstname, lastname);

    const now = new Date();

    const meansOfLogin = [
        ctx.factory.document({
            type: 'username',
            data: username
        }),
        ctx.factory.document({
            type: 'mail',
            data: `${username}@gmail.com`
        })
    ];

    const memberships = [
        ctx.factory.document({
            group_id: ctx.defaultGroup.id,
            period_id: ctx.defaultPeriod.id
        })
    ]

    if (opts.ticket) {
        meansOfLogin.push(ctx.factory.document({
            type: 'ticketId',
            data: `ticket-${randomstring.generate(5)}`
        }));
    }

    if (opts.card) {
        meansOfLogin.push(ctx.factory.document({
            type: 'cardId',
            data: randomstring.generate({ length: 15, charset: 'hex' })
        }));
    }

    const user = new ctx.factory.db.models.User(ctx.factory.document({
        firstname,
        lastname,
        // 1234
        pin: '$2y$10$fu/BM5Y7ktitbqkPuBYz6OKPB3ge5AsZGD5wLP6nBN0VnbxLW80UK',
        // abcd
        password: '$2y$10$0X3NPBy62Ipg1DKslJPIP.4Q9XY03dPTLvat0iLvS7KbaPQa4tLHK',
        mail: `${username}@gmail.com`,
        clientTime: now
    }));

    await user.save();

    for (let meanOfLogin of meansOfLogin) {
        meanOfLogin.user_id = user.id;

        const { id } = await new ctx.factory.db.models.MeanOfLogin(meanOfLogin).save();
        meanOfLogin.id = id;
    }

    for (let membership of memberships) {
        membership.user_id = user.id;

        const { id } = await new ctx.factory.db.models.Membership(membership).save();
        membership.id = id;
    }

    ctx.factory.clears.push(
        ...memberships.map(m => (ctx) => new ctx.factory.db.models.Membership({ id: m.id }).destroy({ hardDelete: true })),
        ...meansOfLogin.map(m => (ctx) => new ctx.factory.db.models.MeanOfLogin({ id: m.id }).destroy({ hardDelete: true })),
        (ctx) => new ctx.factory.db.models.User({ id: user.id }).destroy({ hardDelete: true })
    )

    return {
        name,
        data: Object.assign(
            user.toJSON(),
            {
                memberships,
                meansOfLogin
            }
        )
    }
}
