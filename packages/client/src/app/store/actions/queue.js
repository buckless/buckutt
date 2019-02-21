import localForage from 'localforage';
import uuid from 'uuid';
import crypto from 'crypto';
import Queue from '@buckless/offline-queue';

let queue;
let currentApiQueue;

export const initQueue = store => {
    if (!store.state.device.api || (queue && store.state.device.api === currentApiQueue)) {
        return;
    }

    currentApiQueue = store.state.device.api;
    if (queue) {
        queue.destroy();
    }

    queue = new Queue({
        process(job) {
            return store.dispatch('currentTokenAxios', job.data);
        },

        interval: 60000,
        storage: localForage.createInstance({
            storeName: crypto
                .createHash('md5')
                .update(currentApiQueue)
                .digest('hex')
        })
    });

    queue.on('processed', (job, result) => {
        if (job.data.data.localId) {
            store.dispatch('updateOfflineEntry', {
                localId: job.data.data.localId,
                basketData: result.data
            });
        }
    });

    queue.on('synchronizing', () => {
        store.commit('LOCK_QUEUE', true);
    });

    queue.on('synchronized', () => {
        store.commit('LOCK_QUEUE', false);
        store.commit('SET_LAST_QUEUE', new Date());
    });
};

export const syncQueue = store => {
    if (store.state.online.offline.queue.locked || !queue) {
        return;
    }

    return queue.sync();
};

export const sendRequest = (store, job) => {
    if (job.data) {
        job.data.clientTime = job.clientTime || new Date();
    }

    if (!store.state.auth.device.event.config.useCardData) {
        return store.dispatch('currentTokenAxios', job);
    }

    const forceOffline =
        !store.state.online.status || navigator.connection.downlink < 0.2 || job.forceOffline;

    if (job.noQueue) {
        if (forceOffline && !job.forceOnline) {
            return (
                job.offlineAnswer ||
                Promise.reject({
                    response: { data: { message: 'Server not reacheable' } }
                })
            );
        }

        return store.dispatch('currentTokenAxios', job).catch(err => {
            return job.offlineAnswer || Promise.reject(err);
        });
    }

    return queue.push({
        data: {
            method: job.method,
            url: job.url,
            data: job.data,
            params: {
                headers: { 'Idempotency-Key': uuid() }
            }
        },

        immediate: !forceOffline && job.immediate,

        mock: job.offlineAnswer
    });
};
