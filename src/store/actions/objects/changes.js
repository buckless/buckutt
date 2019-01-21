import { generateSignature } from '@/lib/fetch';

let changes;

export function initSocket({ dispatch }, token) {
    if (changes && typeof changes.close === 'function') {
        changes.close();
    }

    const signature = encodeURIComponent(generateSignature('GET', 'live/listenForModelChanges'));

    changes = new EventSource(
        `${
            config.api
        }/live/listenForModelChanges?authorization=Bearer ${token}&fingerprint=admin&signature=${signature}&handshake-interval=10000&lastEventId=12345&retry=3000`
    );

    changes.addEventListener('message', e => {
        try {
            const doc = JSON.parse(e.data);
            const route = doc.route;

            if (doc.action === 'create') {
                const objects = Array.isArray ? doc.data.to : [doc.data.to];
                dispatch('checkAndAddObjects', { route, objects });
            }

            if (doc.action === 'update') {
                dispatch('checkAndUpdateObjects', { route, objects: [doc.data.to] });
            }

            if (doc.action === 'delete') {
                dispatch('checkAndDeleteObjects', { route, objects: [doc.data.from] });
            }
        } catch (err) {
            console.error('invalid model detected', e.data, err);
        }
    });
}

export function closeSocket() {
    changes.close();
}
