import io from 'socket.io-client/dist/socket.io.js';
import axios from '@/utils/axios';

let socket = null;

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
            store.dispatch('syncQueue');
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

export const logOperator = store => {
    if (store.getters.tokenHeaders.headers || !store.state.auth.seller.isAuth) {
        return Promise.resolve();
    }

    const credentials = {
        meanOfLogin: config.loginMeanOfLogin,
        data: store.state.auth.seller.meanOfLogin,
        pin: store.state.auth.seller.pin
    };

    // Use axios to avoid a logOperator loop
    return axios
        .post('services/login', credentials)
        .then(res => store.commit('UPDATE_TOKEN', res.data.token));
};

export const setSellers = (store, payload) => {
    store.commit('SET_SELLERS', payload);
};

export const setDefaultItems = (store, payload) => {
    store.commit('SET_DEFAULT_ITEMS', payload);
};

export const currentTokenAxios = (store, job) => {
    // We try to log-in the current seller before any request
    return store.dispatch('logOperator').then(() =>
        axios({
            method: job.method || 'get',
            url: job.url,
            data: job.data,
            ...Object.assign({}, store.getters.tokenHeaders, job.params)
        })
    );
};
