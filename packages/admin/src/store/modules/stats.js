const state = {
    curves: [],
    curvesData: {},
    globalData: {},
    purchasesDivision: [],
    reloadsDivision: []
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
    },
    UPDATEGLOBALDATA(state_, globalData) {
        state_.globalData = globalData;
    },
    UPDATEPURCHASESDIVISION(state_, purchasesDivision) {
        state_.purchasesDivision = purchasesDivision;
    },
    UPDATERELOADSDIVISION(state_, reloadsDivision) {
        state_.reloadsDivision = reloadsDivision;
    }
};

export default {
    state,
    mutations
};
