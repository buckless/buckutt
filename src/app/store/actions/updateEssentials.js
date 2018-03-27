import axios         from '../../utils/axios';
import hasEssentials from '../../utils/offline/hasEssentials';
import OfflineData   from '../../../lib/offlineData';


// offlineData once booleans
let assignedUsers = false;

export const updateEssentials = (store, force) => {
    const offlineData = new OfflineData();

    return offlineData.init()
        .then(() => axios.get(`${config.api}/services/deviceEssentials`))
        .then((res) => {
            if (!store.state.auth.device.point.id || store.state.auth.seller.canAssign || force) {
                store.dispatch('setPoint', {
                    id   : res.headers.device,
                    wiket: res.headers.wiket,
                    point: {
                        id  : res.headers.point,
                        name: res.headers.pointname
                    },
                    event: {
                        id  : res.headers.event,
                        name: res.headers.eventname
                    }
                });
            }

            store.dispatch('setSellers', res.data);

            if (store.state.auth.seller.canAssign && !assignedUsers) {
                assignedUsers = true;

                const filterRel = [ {
                    embed   : 'meansOfLogin',
                    filters : [['type', '=', 'ticketId']],
                    required: true
                } ];

                const embed = encodeURIComponent(JSON.stringify(filterRel));

                return axios.get(`${config.api}/users?embed=${embed}`, store.getters.tokenHeaders);
            }

            return Promise.resolve(null);
        })
        .then((res) => {
            if (!res) {
                if (store.state.auth.seller.canControl) {
                    return axios.get(`${config.api}/services/controller`, store.getters.tokenHeaders);
                }

                return;
            }

            const users = res.data.map(user => [
                user.id,
                `${user.firstname} ${user.lastname}`,
                user.meansOfLogin[0].data,
                user.credit
            ]);

            return offlineData.empty('users')
                .then(() => offlineData.insert('users', users));
        })
        .then((res) => {
            if (!res || !Array.isArray(res.data)) {
                return;
            }

            window.db = offlineData;

            const accesses = res.data.map((access, i) => [
                i + 1,
                access.cardId,
                access.groupId,
                access.start,
                access.end
            ]);

            return offlineData.empty('accesses')
                .then(() => offlineData.insert('accesses', accesses));
        })
        .catch((err) => {
            console.log(err);

            if (err.message === 'Network Error') {
                if (!hasEssentials()) {
                    store.commit('ERROR', { message: 'This device doesn\'t meet the minimal requirements to run offline.' });
                    return;
                }

                return;
            }
        });
};
