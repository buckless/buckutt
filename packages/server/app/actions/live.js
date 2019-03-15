const EventEmitter = require('events');
const { Observable } = require('rxjs');
const { invert } = require('lodash');
const { modelsNames } = require('server/app/utils/modelParser');

const routeNames = invert(modelsNames);
const stream = new EventEmitter();

// arbirtrary max devices
stream.setMaxListeners(1000);

// setup observable and event emitter
const setup = app => {
    app.locals.sub.on('message', (channel, message) => {
        if (!message || message.length === 0) {
            return;
        }

        stream.emit(channel, JSON.parse(message));
    });
};

const alert = () =>
    Observable.create(observer => {
        stream.on('data', ({ action, model, data }) => {
            if (action !== 'create' || model !== 'Alert') {
                return;
            }

            const alert = data.to[0];

            observer.next(alert);
        });
    });

const healthalert = () =>
    Observable.create(observer => {
        stream.on('data', ({ action, model, data }) => {
            if (action !== 'create' || model !== 'HealthAlert') {
                return;
            }

            const alert = data.to[0];

            observer.next(alert);
        });
    });

const modelChanges = () =>
    Observable.create(observer => {
        stream.on('data', ({ action, model, data }) => {
            const route = routeNames.hasOwnProperty(model) ? routeNames[model] : null;

            observer.next({ action, model, route, data });
        });
    });

const credit = walletId =>
    Observable.create(observer => {
        stream.on('walletCreditUpdate', ({ id, credit, pending }) => {
            if (id !== walletId) {
                return;
            }

            observer.next({ id, credit, pending });
        });
    });

module.exports = {
    setup,
    alert,
    healthalert,
    modelChanges,
    credit
};
