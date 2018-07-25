module.exports.marshal = function marshal(mw) {
    return function connectorMiddleware(path, socket, app) {
        socket.connector = socket.connector || {
            headers: socket.client.request.headers,

            query: {},

            path,

            method: 'GET',

            models: app.locals.models,

            result: {
                err: null,
                headers: {}
            },

            get date() {
                return new Date();
            },

            header(name, value) {
                socket.connector.result.headers[name] = value;
            }
        };

        return mw(socket.connector)
            .catch(err => {
                socket.connector.result.err = err;

                return Promise.resolve();
            })
            .then(() => {
                socket.connector.result.user = socket.connector.user;

                return socket.connector.result;
            });
    };
};

module.exports.unmarshal = function unmarshal(socket) {
    socket.user = socket.connector.result.user;
    socket.details = socket.connector.details;
};
