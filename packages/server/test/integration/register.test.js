const test = require('ava');
const { factory, user, ticket, wallet, clear } = require('../utils/factory');
const { register } = require('server/app/actions/manager/auth/register');

test.before(t =>
    factory(
        t,
        user('mailtest'),
        user('cardtest', { card: true }),
        user('tickettest', { ticket: true }),
        wallet('wallet1', { card: true }),
        wallet('wallet2', { card: true, ticket: true }),
        ticket('ticket')
    )
);

test('create a user with credentials provided', async t => {
    const user = await register(t.context.ctx, {
        firstname: 'Test',
        lastname: 'Test',
        mail: 'test@buckless.com'
    });

    t.is(user.firstname, 'Test');
    t.is(user.lastname, 'Test');
    t.is(user.mail, 'test@buckless.com');

    t.truthy(user.wallet.id);
    t.falsy(user.wallet.logical_id);

    await new t.context.factory.db.models.Wallet({ id: user.wallet.id }).destroy({
        hardDelete: true
    });
    await t.context.factory.db.models.Membership.where({ user_id: user.id }).destroy({
        hardDelete: true
    });
    await new t.context.factory.db.models.User({ id: user.id }).destroy({ hardDelete: true });

    t.pass();
});

test('deny creation if the mail address is already taken', async t => {
    const { firstname, lastname, mail } = t.context.mailtest;
    const error = await t.throwsAsync(register(t.context.ctx, { firstname, lastname, mail }));
    t.is(error.message, 'This mail is already taken');

    t.pass();
});

test('deny creation if the mail address is missing and no ticket provided', async t => {
    const error = await t.throwsAsync(
        register(t.context.ctx, { firstname: 'Test', lastname: 'Test' })
    );
    t.is(error.message, 'Ticket or user informations are needed');

    t.pass();
});

test('create a user with credentials and card number provided', async t => {
    const user = await register(t.context.ctx, {
        firstname: 'Test',
        lastname: 'Test',
        mail: 'test@buckless.com',
        physicalId: 'P1'
    });

    t.is(user.firstname, 'Test');
    t.is(user.lastname, 'Test');
    t.is(user.mail, 'test@buckless.com');

    t.truthy(user.wallet.id);
    t.is(user.wallet.logical_id, 'L1');
    t.is(user.wallet.physical_id, 'P1');

    await new t.context.factory.db.models.Wallet({ id: user.wallet.id }).destroy({
        hardDelete: true
    });
    await t.context.factory.db.models.Membership.where({ user_id: user.id }).destroy({
        hardDelete: true
    });
    await new t.context.factory.db.models.User({ id: user.id }).destroy({ hardDelete: true });

    t.pass();
});

test('create a user with credentials and card number related to an anonymous wallet', async t => {
    const { physical_id, logical_id } = t.context.wallet1;
    const user = await register(t.context.ctx, {
        firstname: 'Test',
        lastname: 'Test',
        mail: 'test@buckless.com',
        physicalId: physical_id
    });

    t.is(user.firstname, 'Test');
    t.is(user.lastname, 'Test');
    t.is(user.mail, 'test@buckless.com');

    t.truthy(user.wallet.id);
    t.is(user.wallet.logical_id, logical_id);
    t.is(user.wallet.physical_id, physical_id);

    await new t.context.factory.db.models.Wallet({ id: user.wallet.id }).save({ user_id: null });
    await t.context.factory.db.models.Membership.where({ user_id: user.id }).save(
        { user_id: null, wallet_id: user.wallet.id },
        { patch: true }
    );
    await new t.context.factory.db.models.User({ id: user.id }).destroy({ hardDelete: true });

    t.pass();
});

test("deny creation if the provided card doesn't exist", async t => {
    const error = await t.throwsAsync(
        register(t.context.ctx, {
            firstname: 'Error',
            lastname: 'Error',
            mail: 'error@buckless.com',
            physicalId: 'fakeId'
        })
    );
    t.is(error.message, 'Card not found');

    t.pass();
});

test('deny creation if the provided card already belongs to a user', async t => {
    const error = await t.throwsAsync(
        register(t.context.ctx, {
            firstname: 'Error',
            lastname: 'Error',
            mail: 'error@buckless.com',
            physicalId: t.context.cardtest.wallets[0].physical_id
        })
    );
    t.is(error.message, 'This card already belongs to a user');

    t.pass();
});

test('create a user with a ticket number provided', async t => {
    const { firstname, lastname, mail, physical_id, logical_id } = t.context.ticket;
    const user = await register(t.context.ctx, { ticketNumber: physical_id });

    t.is(user.firstname, firstname);
    t.is(user.lastname, lastname);
    t.is(user.mail, mail);

    t.truthy(user.wallet.id);
    t.falsy(user.wallet.logical_id);

    t.truthy(user.wallet.ticket.id);
    t.is(user.wallet.ticket.logical_id, logical_id);
    t.is(user.wallet.ticket.physical_id, physical_id);

    await new t.context.factory.db.models.Ticket({ id: user.wallet.ticket.id }).save({
        wallet_id: null
    });
    await new t.context.factory.db.models.Wallet({ id: user.wallet.id }).destroy({
        hardDelete: true
    });
    await t.context.factory.db.models.Membership.where({ user_id: user.id }).destroy({
        hardDelete: true
    });
    await new t.context.factory.db.models.User({ id: user.id }).destroy({ hardDelete: true });

    t.pass();
});

test('create a user with an anonymous wallet related to the ticket number', async t => {
    const { physical_id, logical_id, ticket } = t.context.wallet2;
    const user = await register(t.context.ctx, { ticketNumber: ticket.physical_id });

    t.is(user.firstname, ticket.firstname);
    t.is(user.lastname, ticket.lastname);
    t.is(user.mail, ticket.mail);

    t.truthy(user.wallet.id);
    t.is(user.wallet.logical_id, logical_id);
    t.is(user.wallet.physical_id, physical_id);

    t.truthy(user.wallet.ticket.id);
    t.is(user.wallet.ticket.logical_id, ticket.logical_id);
    t.is(user.wallet.ticket.physical_id, ticket.physical_id);

    await new t.context.factory.db.models.Wallet({ id: user.wallet.id }).save({ user_id: null });
    await t.context.factory.db.models.Membership.where({ user_id: user.id }).save(
        { user_id: null, wallet_id: user.wallet.id },
        { patch: true }
    );
    await new t.context.factory.db.models.User({ id: user.id }).destroy({ hardDelete: true });

    t.pass();
});

test('create a user with a provided anonymous wallet related to the ticket number', async t => {
    const { physical_id, logical_id, ticket } = t.context.wallet2;
    const user = await register(t.context.ctx, {
        ticketNumber: ticket.physical_id,
        physicalId: physical_id
    });

    t.is(user.firstname, ticket.firstname);
    t.is(user.lastname, ticket.lastname);
    t.is(user.mail, ticket.mail);

    t.truthy(user.wallet.id);
    t.is(user.wallet.logical_id, logical_id);
    t.is(user.wallet.physical_id, physical_id);

    t.truthy(user.wallet.ticket.id);
    t.is(user.wallet.ticket.logical_id, ticket.logical_id);
    t.is(user.wallet.ticket.physical_id, ticket.physical_id);

    await new t.context.factory.db.models.Wallet({ id: user.wallet.id }).save({ user_id: null });
    await t.context.factory.db.models.Membership.where({ user_id: user.id }).save(
        { user_id: null, wallet_id: user.wallet.id },
        { patch: true }
    );
    await new t.context.factory.db.models.User({ id: user.id }).destroy({ hardDelete: true });

    t.pass();
});

test("deny creation if the provided ticket doesn't exist", async t => {
    const error = await t.throwsAsync(register(t.context.ctx, { ticketNumber: 'fakeId' }));
    t.is(error.message, "Couldn't find ticket");

    t.pass();
});

test('deny creation if the provided ticket already belongs to a user', async t => {
    const error = await t.throwsAsync(
        register(t.context.ctx, {
            ticketNumber: t.context.tickettest.wallets[0].ticket.physical_id
        })
    );
    t.is(error.message, 'This ticket already belongs to another wallet');

    t.pass();
});

test('create a user with a card and a ticket number provided', async t => {
    const { firstname, lastname, mail, physical_id, logical_id } = t.context.ticket;
    const user = await register(t.context.ctx, { ticketNumber: physical_id, physicalId: 'P2' });

    t.is(user.firstname, firstname);
    t.is(user.lastname, lastname);
    t.is(user.mail, mail);

    t.truthy(user.wallet.id);
    t.is(user.wallet.logical_id, 'L2');
    t.is(user.wallet.physical_id, 'P2');

    t.truthy(user.wallet.ticket.id);
    t.is(user.wallet.ticket.logical_id, logical_id);
    t.is(user.wallet.ticket.physical_id, physical_id);

    await new t.context.factory.db.models.Ticket({ id: user.wallet.ticket.id }).save({
        wallet_id: null
    });
    await new t.context.factory.db.models.Wallet({ id: user.wallet.id }).destroy({
        hardDelete: true
    });
    await t.context.factory.db.models.Membership.where({ user_id: user.id }).destroy({
        hardDelete: true
    });
    await new t.context.factory.db.models.User({ id: user.id }).destroy({ hardDelete: true });

    t.pass();
});

test('create a user with a mail and a ticket number provided', async t => {
    const { firstname, lastname, physical_id, logical_id } = t.context.ticket;
    const user = await register(t.context.ctx, {
        mail: 'test@buckless.com',
        ticketNumber: physical_id
    });

    t.is(user.firstname, firstname);
    t.is(user.lastname, lastname);
    t.is(user.mail, 'test@buckless.com');

    t.truthy(user.wallet.id);
    t.falsy(user.wallet.logical_id);

    t.truthy(user.wallet.ticket.id);
    t.is(user.wallet.ticket.logical_id, logical_id);
    t.is(user.wallet.ticket.physical_id, physical_id);

    await new t.context.factory.db.models.Ticket({ id: user.wallet.ticket.id }).save({
        wallet_id: null
    });
    await new t.context.factory.db.models.Wallet({ id: user.wallet.id }).destroy({
        hardDelete: true
    });
    await t.context.factory.db.models.Membership.where({ user_id: user.id }).destroy({
        hardDelete: true
    });
    await new t.context.factory.db.models.User({ id: user.id }).destroy({ hardDelete: true });

    t.pass();
});

test("deny creation if the provided ticket already has a wallet and the provided card number doesn't match", async t => {
    const error = await t.throwsAsync(
        register(t.context.ctx, {
            ticketNumber: t.context.wallet2.ticket.physical_id,
            physicalId: t.context.wallet1.physical_id
        })
    );
    t.is(error.message, 'This ticket already belongs to another wallet');

    t.pass();
});

test.after.always(t => clear(t));
