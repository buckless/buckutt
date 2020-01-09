import axios from 'axios';
import uuid from 'uuid';

import { store } from '../store';

export const getBaseUrl = (source = process.env) => {
    const { BASE_URL: baseUrl } = source;

    return !baseUrl || baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
};

export const api = axios.create({
    baseURL: `${getBaseUrl()}api`
});

api.interceptors.request.use(config => {
    config.headers['Idempotency-Key'] = uuid();

    // eslint-disable-next-line no-console
    const token = store.getters['user/getToken'];
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    res => res,
    err => {
        if (
            err &&
            err.response &&
            err.response.data &&
            err.response.status === 401 &&
            err.response.data.message === 'Token expired'
        ) {
            store.dispatch('user/logout');
            return;
        }

        throw err;
    }
);

if (process.env.NODE_ENV === 'development') {
    window.api = api;
}
