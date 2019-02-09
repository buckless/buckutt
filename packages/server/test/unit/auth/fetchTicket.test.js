const test = require('ava');
const { factory, user, clear } = require('../../utils/factory');

test.before(t =>
    factory(
        t,
        // with memberships and group
        user('john', { ticket: true })
    )
);

test('actions:auth:fetchTicket', async t => {
    // case 1 : ticket is in ticket provider
    // case 2 : ticket is in DB
    // case 3 : no ticket found

    t.is(t.context.john.firstname, t.context.john.firstname);

    // ensure currentGroups
});

test.after.always(t => clear(t));
