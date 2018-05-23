import localForage from 'localforage';
import Queue from '@buckless/offline-queue';

let queue;

export const initQueue = store => {
    if (queue) {
        return;
    }

    queue = new Queue({
        process(job) {
            return store.dispatch('currentTokenAxios', job);
        },

        syncInterval: 60000,
        syncToStorage: localForage
    });

    queue.on('processed', (job, result) => {
        if (job.data.localId) {
            store.dispatch('updateOfflineEntry', {
                localId: job.data.localId,
                basketData: result.data
            });
        }
    });

    queue.on('synchronizing', () => {
        store.commit('SET_SYNCING', true);
    });

    queue.on('synchronized', () => {
        store.dispatch('sendValidCancellations').then(() => {
            setTimeout(() => {
                store.commit('SET_SYNCING', false);
            }, 200);
        });
    });
};

export const syncQueue = store => {
    if (store.state.online.syncing) {
        return;
    }

    return queue.sync();
};

export const sendRequest = (store, job) => {
    if (!store.state.auth.device.event.config.useCardData) {
        return store.dispatch('currentTokenAxios', job);
    }

    const forceOffline = !store.state.online.status || navigator.connection.downlink < 0.2;

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

    return queue
        .method(job.method)
        .url(job.url)
        .data(job.data)
        .setImmediate(!forceOffline && job.immediate)
        .push({
            mock: job.offlineAnswer
        });
};
