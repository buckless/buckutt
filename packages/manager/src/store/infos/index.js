import { initialState as state, reducer as mutations } from './reducer';

import * as getters from './selectors';
import * as actions from './actions';

export default {
    namespaced: true,
    state,
    mutations,
    getters,
    actions
};
