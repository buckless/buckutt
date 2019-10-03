import { get } from '@/lib/fetch';
import routeToRelation from '@/lib/routeToRelation';
import pathToRoute from '@/lib/pathToRoute';
import normalize from '@/lib/normalize';

export const retrieveObject = async ({ dispatch }, data) => {
    const embed = routeToRelation(data.route) ? `?embed=${routeToRelation(data.route)}` : '';

    const result = await get(`crud/${data.route}/${data.id}${embed}`);
    await dispatch('normalizeAndSet', { route: data.route, results: [result] });

    return result;
};

export const fetchObjects = async ({ dispatch }, data) => {
    const embed = routeToRelation(data.route) ? `?embed=${routeToRelation(data.route)}` : '';

    const results = await get(`crud/${data.route.toLowerCase()}${embed}`);
    return dispatch('normalizeAndSet', { route: data.route, results });
};

export const normalizeAndSet = async ({ commit }, data) => {
    data.results.forEach(result => {
        const { entities } = normalize(result, data.route);

        Object.keys(entities).forEach(entity => {
            commit('SETOBJECTS', {
                route: entity,
                objects: Object.values(entities[entity])
            });
        });
    });
};

export const loadFocusedElements = ({ dispatch }, data) =>
    Promise.all(
        Object.keys(data).map(key =>
            dispatch('retrieveObject', {
                route: pathToRoute(key),
                id: data[key]
            })
        )
    );
