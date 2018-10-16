import { get } from '../../lib/fetch';

/**
 * Stats actions
 */

export function fetchGlobalData({ commit }) {
    return get('stats/graphs/global').then(globalData => {
        commit('UPDATEGLOBALDATA', globalData);
    });
}

export function fetchPointsDivision({ commit }, { dateIn, dateOut }) {
    const q = [];

    if (dateIn && dateOut) {
        q.push(`dateIn=${dateIn.toISOString()}`);
        q.push(`dateOut=${dateOut.toISOString()}`);
    }

    const qString = q.join('&');

    return get(`stats/graphs/pointsDivision?${qString}`).then(pointsDivision => {
        commit('UPDATEPURCHASESDIVISION', pointsDivision.purchases);
        commit('UPDATERELOADSDIVISION', pointsDivision.reloads);
    });
}

export function fetchCurvesData({ commit }, payload) {
    const q = [];

    if (payload.dateIn && payload.dateOut) {
        q.push(`dateIn=${payload.dateIn.toISOString()}`);
        q.push(`dateOut=${payload.dateOut.toISOString()}`);
    }

    if (payload.additive) {
        q.push('additive=1');
    }

    const filters = payload.curves.map(curve => {
        const qCurve = {};
        Object.keys(curve)
            .filter(key => curve[key])
            .forEach(key => {
                qCurve[key] = curve[key].id;
            });

        return qCurve;
    });

    q.push(`filters=${encodeURIComponent(JSON.stringify(filters))}`);

    const qString = q.join('&');

    return get(`stats/graphs/purchases?${qString}`).then(curvesData => {
        commit('UPDATECURVESDATA', curvesData);
    });
}

export function addCurve({ commit }, curve) {
    commit('ADDCURVE', curve);
}

export function removeCurve({ commit }, curveIndex) {
    commit('DELETECURVE', curveIndex);
}
