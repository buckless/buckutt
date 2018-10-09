const EventEmitter = require('events');
const { Observable } = require('rxjs');
const { invert } = require('lodash');
const { modelsNames } = require('@/utils/modelParser');

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

const modelChanges = () =>
    Observable.create(observer => {
        stream.on('data', ({ action, model, data }) => {
            const route = routeNames.hasOwnProperty(model) ? routeNames[model] : null;

            observer.next({ action, model, route, data });
        });
    });

const credit = userId =>
    Observable.create(observer => {
        stream.on('userCreditUpdate', ({ id, credit, pending }) => {
            if (id !== userId) {
                return;
            }

            observer.next({ credit, pending });
        });
    });

module.exports = {
    setup,
    alert,
    modelChanges,
    credit
};
