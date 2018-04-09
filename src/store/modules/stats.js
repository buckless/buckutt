const state = {
    curves: [],
    curvesData: {}
};

// mutations
const mutations = {
    UPDATECURVESDATA(state_, data) {
        state_.curvesData = data;
    },
    ADDCURVE(state_, curve) {
        state_.curves.push(curve);
    },
    DELETECURVE(state_, curveIndex) {
        state_.curves.splice(curveIndex, 1);
    }
};

export default {
    state,
    mutations
};
