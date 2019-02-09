import { uniqBy } from 'lodash/array';

const initialState = {
    alerts: []
};

const mutations = {
    PUSH_ALERT(state, alert) {
        state.alerts = uniqBy(state.alerts.concat(alert), a => a.id);
    },

    TOGGLE_ALERT(state, id) {
        const alert = state.alerts.find(a => a.id === id);

        alert.active = !alert.active;
    }
};

export default { state: initialState, mutations };
