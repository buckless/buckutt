import axios from '@/utils/axios';
import generateSignature from '@/utils/generateSignature';
import { merge } from 'lodash/object';

let status;
let alert;
let healthAlert;

export const setupSocket = ({ state, commit, dispatch }) =>
    new Promise(resolve => {
        const fingerprint = window.fingerprint || '';

        if (status && typeof status.close === 'function') {
            status.close();
        }

        const signature = generateSignature(
            state.auth.device.privateKey,
            window.fingerprint,
            'GET',
            'live/status'
        );

        status = new EventSource(
            `${
                state.device.api
            }/live/status?fingerprint=${fingerprint}&signature=${signature}&handshake-interval=20000&lastEventId=12345&retry=3000`
        );

        status.addEventListener('open', () => {
            if (!state.online.status) {
                commit('SET_ONLINE');
            }

            resolve();

            dispatch('logOperator')
                .then(() => {
                    dispatch('updateEssentials');
                    dispatch('syncQueue');
                })
                .then(() => dispatch('listenAlerts'))
                .then(() => dispatch('listenHealthAlerts'));
        });

        status.addEventListener('error', err => {
            console.log(err);
            if (state.online.status) {
                commit('SET_OFFLINE');
            }

            dispatch('checkDevice');
            resolve();

            // Retry to connect every 10s
            setTimeout(() => {
                dispatch('setupSocket');
            }, 10000);
        });
    });

export const listenAlerts = ({ state, dispatch }) => {
    const token = state.auth.seller.token;

    if (alert && typeof alert.close === 'function') {
        alert.close();
    }

    if (token && token.length > 0) {
        const signature = generateSignature(
            state.auth.device.privateKey,
            window.fingerprint,
            'GET',
            'live/alert'
        );

        alert = new EventSource(
            `${state.device.api}/live/alert?authorization=Bearer ${token}&fingerprint=${
                window.fingerprint
            }&signature=${signature}&handshake-interval=20000&lastEventId=12345&retry=3000`
        );

        alert.addEventListener('message', e => {
            try {
                const data = JSON.parse(e.data);

                if (data && data.minimumViewTime) {
                    dispatch('alert', data);
                }
            } catch (err) {
                console.error('invalid alert detected', e.data, err);
            }
        });
    }
};

export const listenHealthAlerts = ({ state, dispatch }) => {
    const token = state.auth.seller.token;

    if (healthAlert && typeof healthAlert.close === 'function') {
        healthAlert.close();
    }

    if (token && token.length > 0) {
        const signature = generateSignature(
            state.auth.device.privateKey,
            window.fingerprint,
            'GET',
            'live/healthalert'
        );

        healthAlert = new EventSource(
            `${state.device.api}/live/healthalert?authorization=Bearer ${token}&fingerprint=${
                window.fingerprint
            }&signature=${signature}&handshake-interval=20000&lastEventId=12345&retry=3000`
        );

        healthAlert.addEventListener('message', e => {
            try {
                const data = JSON.parse(e.data);
                if (data && data.minimumViewTime) {
                    dispatch('healthAlert', data);
                }
            } catch (err) {
                console.error('invalid healthAlert detected', e.data, err);
            }
        });
    }
};

export const logOperator = store => {
    if (!store.getters.sellerLogged || store.state.auth.seller.token) {
        return Promise.resolve();
    }

    const credentials = {
        wallet: store.state.auth.seller.wallet,
        pin: store.state.auth.seller.pin
    };

    const signature = generateSignature(
        store.state.auth.device.privateKey,
        window.fingerprint,
        'POST',
        'auth/login'
    );

    // Use axios to avoid a logOperator loop
    return axios(store.state.device.api)
        .post('auth/login', credentials, {
            headers: {
                'X-fingerprint': window.fingerprint,
                'X-signature': signature
            }
        })
        .then(res => store.commit('UPDATE_TOKEN', res.data.token));
};

export const setSellers = (store, payload) => {
    store.commit('SET_SELLERS', payload);
};

export const setDefaultItems = (store, payload) => {
    store.commit('SET_DEFAULT_ITEMS', payload);
};

export const setBlockedCards = (store, payload) => {
    store.commit('SET_BLOCKED_CARDS', payload);
};

export const currentTokenAxios = (store, job) => {
    const method = job.method || 'get';
    const signature = generateSignature(
        store.state.auth.device.privateKey,
        window.fingerprint,
        method.toUpperCase(),
        job.url
    );

    // We try to log-in the current seller before any request
    return store
        .dispatch('logOperator')
        .then(() =>
            axios(store.state.device.api)({
                method,
                url: job.url,
                data: job.data,
                ...merge(
                    {
                        headers: {
                            'X-fingerprint': window.fingerprint,
                            'X-signature': signature
                        }
                    },
                    store.getters.tokenHeaders,
                    job.params
                )
            })
        )
        .catch(err => {
            if (err.response.data.message === 'Token expired') {
                store.commit('UPDATE_TOKEN');
            }

            return Promise.reject(err);
        });
};
