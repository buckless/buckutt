import axios from '@/utils/axios';
import merge from 'lodash.merge';
import io from 'socket.io-client/dist/socket.io.js';
import { sendBasket } from './basket';
import q from '../../utils/q';

let socket = null;
let lock = false;

export const setupSocket = (store, token) => {
    if (socket) {
        socket.off('disconnect');
        socket.close();
    }

    let opts = {};

    if (token) {
        opts = {
            transportOptions: {
                polling: {
                    extraHeaders: {
                        Authorization: `Bearer ${token}`
                    }
                }
            }
        };
    }

    socket = io(config.api, { rejectUnauthorized: false, ...opts });

    socket.on('connect', () => {
        store.commit('SET_ONLINE');
        store.dispatch('logOperator').then(() => {
            store.dispatch('updateEssentials');
            store.dispatch('syncPendingRequests');
        });
        socket.emit('alert');
    });

    socket.on('alert', alert => {
        store.commit('SET_ALERT', alert);
    });

    socket.on('disconnect', () => {
        store.commit('SET_OFFLINE');

        if (!store.state.auth.device.event.config.useCardData) {
            store.commit('ERROR', {
                message: 'Server not reacheable'
            });
        }
    });
};

export const periodicSync = ({ dispatch }) => {
    dispatch('syncPendingRequests').then(() => {
        setTimeout(() => dispatch('periodicSync'), 300000);
    });
};

export const logOperator = store => {
    if (store.getters.tokenHeaders.headers || !store.state.auth.seller.isAuth) {
        return Promise.resolve();
    }

    const credentials = {
        meanOfLogin: config.loginMeanOfLogin,
        data: store.state.auth.seller.meanOfLogin,
        pin: store.state.auth.seller.pin
    };

    return axios
        .post(`${config.api}/services/login`, credentials)
        .then(res => store.commit('UPDATE_TOKEN', res.data.token));
};

export const syncPendingRequests = store => {
    const storedRequests = store.state.online.pendingRequests;
    const failedRequests = [];

    console.log('is-online', store.state.online.status);
    // Continue if the operator is logged (locally or not)
    if (!store.state.auth.seller.isAuth || !store.state.online.status || lock) {
        return Promise.resolve();
    }

    lock = true;
    store.commit('SET_SYNCING', true);

    let promise = Promise.resolve();

    storedRequests.forEach(request => {
        promise = promise
            .then(() => axios.post(request.url, request.body, store.getters.tokenHeaders))
            .then(res => {
                if (request.body.localId) {
                    const localId = request.body.localId;

                    store.dispatch('updateOfflineEntry', {
                        localId,
                        basketData: res.data
                    });
                }
            })
            .then(
                () =>
                    new Promise(resolve => {
                        setTimeout(() => resolve(), 150);
                    })
            )
            .catch(err => {
                failedRequests.push(request);
                console.error('Error while resending basket : ', err);
            });
    });

    return promise.then(() => store.dispatch('sendValidCancellations')).then(() => {
        // wait for 200ms before unlocking (for menu action)
        setTimeout(() => {
            store.commit('SET_SYNCING', false);
            store.dispatch('setPendingRequests', failedRequests);
            lock = false;
        }, 200);
    });
};

export const setSellers = (store, payload) => {
    window.localStorage.setItem('sellers', JSON.stringify(payload));
    store.commit('SET_SELLERS', payload);
};

export const setDefaultItems = (store, payload) => {
    window.localStorage.setItem('defaultItems', JSON.stringify(payload));
    store.commit('SET_DEFAULT_ITEMS', payload);
};

export const addPendingRequest = (store, payload) => {
    payload.body.created_at = new Date();

    store.commit('ADD_PENDING_REQUEST', payload);

    window.localStorage.setItem(
        'pendingRequests',
        JSON.stringify(store.state.online.pendingRequests)
    );
};

export const setPendingRequests = (store, payload) => {
    if (payload.length > 0) {
        store.commit('SET_PENDING_REQUESTS', payload);
    } else {
        store.commit('CLEAR_PENDING_REQUESTS');
    }

    window.localStorage.setItem(
        'pendingRequests',
        JSON.stringify(store.state.online.pendingRequests)
    );
};
