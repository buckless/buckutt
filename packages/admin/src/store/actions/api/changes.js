import { api } from 'config/admin';
import { generateSignature } from '@/lib/fetch';

let changes;

export const initSocket = ({ commit, dispatch }, token) => {
    if (changes && typeof changes.close === 'function') {
        changes.close();
    }

    const signature = encodeURIComponent(generateSignature('GET', 'live/listenForModelChanges'));

    changes = new EventSource(
        `${api}/live/listenForModelChanges?authorization=Bearer ${token}&fingerprint=admin&signature=${signature}&handshake-interval=10000&lastEventId=12345&retry=3000`
    );

    changes.addEventListener('message', e => {
        try {
            const doc = JSON.parse(e.data);
            const route = doc.route;

            if (doc.action === 'create') {
                const results = Array.isArray ? doc.data.to : [doc.data.to];
                dispatch('normalizeAndSet', { route, results });
            }

            if (doc.action === 'update') {
                dispatch('normalizeAndSet', { route, results: [doc.data.to] });
            }

            if (doc.action === 'delete') {
                commit('DELETEOBJECTS', { route, objects: [doc.data.from] });
            }
        } catch (err) {
            console.error('invalid model detected', e.data, err);
        }
    });
};

export const closeSocket = () => changes.close();
