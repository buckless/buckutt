import localForage from 'localforage';
import Queue from '@buckless/offline-queue';

let queue;

export const initQueue = store => {
    if (queue) {
        return;
    }

    queue = new Queue({
        process(job) {
            return store.dispatch('currentTokenAxios', job.data);
        },

        interval: 60000,
        storage: localForage
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
        store.dispatch('sendValidCancellations').then(() => {
            setTimeout(() => {
                store.commit('LOCK_QUEUE', false);
                store.commit('SET_LAST_QUEUE', new Date());
            }, 200);
        });
    });
};

export const syncQueue = store => {
    if (store.state.online.offline.queue.locked) {
        return;
    }

    return queue.sync();
};

export const sendRequest = (store, job) => {
    if (!store.state.auth.device.event.config.useCardData) {
        return store.dispatch('currentTokenAxios', job);
    }

    const forceOffline =
        !store.state.online.status || navigator.connection.downlink < 0.2 || job.forceOffline;

    if (job.noQueue) {
        if (forceOffline) {
            return (
                job.offlineAnswer ||
                Promise.reject({ response: { data: { message: 'Server not reacheable' } } })
            );
        }

        return store.dispatch('currentTokenAxios', job).catch(err => {
            return job.offlineAnswer || Promise.reject(err);
        });
    }

    job.data.created_at = new Date();

    return queue.push({
        data: {
            method: job.method,
            url: job.url,
            data: job.data
        },

        immediate: !forceOffline && job.immediate,

        mock: job.offlineAnswer
    });
};
