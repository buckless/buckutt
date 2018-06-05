const log = require('../../lib/log')(module);

const send = (clients, alert) => {
    Object.keys(clients)
        .map(id => clients[id])
        .forEach(client => {
            client.client.emit('alert', alert);
        });
};

module.exports = {
    route: 'alert',

    setup(app, clients) {
        app.locals.modelChanges.on('data', (action, model, data) => {
            if (action !== 'create' || model !== 'Alert') {
                return;
            }

            let alert = data.to[0];
            log.info(`Alert "${alert.content}" for ${alert.minimumViewTime} sec`);
            send(clients, alert);
        });
    },

    client() {}
};
