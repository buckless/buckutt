import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state = {
    allowed: false,
    alreadyAsked: false,
    refundable: 0,
    minimum: 0,
    start: new Date('1970-01-01T01:00:00.000Z'),
    end: new Date('1970-01-01T01:00:00.000Z')
};

export default {
    namespaced: true,
    state,
    actions,
    getters,
    mutations
};
