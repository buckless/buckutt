import { get } from '../../lib/fetch';

/**
 * Stats actions
 */

let idFetchGlobal = 0;
export function fetchGlobalData({ commit }) {
    idFetchGlobal += 1;
    const localId = idFetchGlobal;
    return get('stats/graphs/global').then(globalData => {
        if (localId === idFetchGlobal) {
            commit('UPDATEGLOBALDATA', globalData);
        }
    });
}

let idFetchDivision = 0;
export function fetchPointsDivision({ commit }, { dateIn, dateOut }) {
    idFetchDivision += 1;
    const localId = idFetchDivision;

    const q = [];

    if (dateIn && dateOut) {
        q.push(`dateIn=${dateIn.toISOString()}`);
        q.push(`dateOut=${dateOut.toISOString()}`);
    }

    const qString = q.join('&');

    return get(`stats/graphs/pointsDivision?${qString}`).then(pointsDivision => {
        if (localId === idFetchDivision) {
            commit('UPDATEPURCHASESDIVISION', pointsDivision.purchases);
            commit('UPDATERELOADSDIVISION', pointsDivision.reloads);
        }
    });
}

let idFetchCurves = 0;
export function fetchCurvesData({ commit }, payload) {
    idFetchCurves += 1;
    const localId = idFetchCurves;

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
        if (localId === idFetchCurves) {
            commit('UPDATECURVESDATA', curvesData);
        }
    });
}

export function addCurve({ commit }, curve) {
    commit('ADDCURVE', curve);
}

export function removeCurve({ commit }, curveIndex) {
    commit('DELETECURVE', curveIndex);
}
