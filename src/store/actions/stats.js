import { get } from '../../lib/fetch';

/**
 * Stats actions
 */

export function fetchCurvesData({ commit }, payload) {
    const q = [];

    if (payload.dateIn && payload.dateOut) {
        q.push(`dateIn=${payload.dateIn.toISOString()}`);
        q.push(`dateOut=${payload.dateOut.toISOString()}`);
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

    return get(`services/stats/purchases?${qString}`).then(curvesData => {
        commit('UPDATECURVESDATA', curvesData);
    });
}

export function addCurve({ commit }, curve) {
    commit('ADDCURVE', curve);
}

export function removeCurve({ commit }, curveIndex) {
    commit('DELETECURVE', curveIndex);
}
