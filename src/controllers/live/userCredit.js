const log = require('../../lib/log')(module);

const send = (clients, userId, credit) => {
    console.log(clients)
    const client = Object.keys(clients)
        .map(id => clients[id])
        .filter(c => c.userCredit)
        .find(c => c.user.id === userId);

    if (client && credit) {
        client.client.emit('userCredit', credit);
    }
};

module.exports = {
    route: 'userCredit',

    setup(app, clients) {
        app.locals.modelChanges.on('userCreditUpdate', update => {
            // update has : id, credit, update
            send(clients, update.id, update);
        });
    },

    client(clients, client) {
        clients[client.id].userCredit = true;
    }
};
