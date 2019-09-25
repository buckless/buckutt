import { post, put, del } from '@/lib/fetch';
import routeToRelation from '@/lib/routeToRelation';
import pathToRoute from '@/lib/pathToRoute';

export const createObject = async ({ commit, dispatch, state }, object) => {
    const embed = routeToRelation(object.route) ? `?embed=${routeToRelation(object.route)}` : '';
    const result = await post(`crud/${object.route.toLowerCase()}${embed}`, object.value);

    if (state.api[object.route]) {
        await dispatch('normalizeAndSet', { route: object.route, results: [result] });
    }

    dispatch('createFocusedElementsRelation', { route: object.route, value: result });

    return result;
};

export const updateObject = async ({ commit, dispatch, state }, object) => {
    if (state.api[object.route]) {
        commit('SETOBJECTS', {
            route: object.route,
            objects: [object.value]
        });
    }

    const embed = routeToRelation(object.route) ? `?embed=${routeToRelation(object.route)}` : '';
    const result = await put(
        `crud/${object.route.toLowerCase()}/${object.value.id}${embed}`,
        object.value
    );

    if (state.api[object.route]) {
        await dispatch('normalizeAndSet', { route: object.route, results: [result] });
    }

    return result;
};

export const removeObject = async ({ commit, dispatch, state }, object) => {
    dispatch('removeFocusedElementsRelation', object);

    if (state.api[object.route]) {
        commit('DELETEOBJECTS', {
            route: object.route,
            objects: [object.value]
        });
    }

    await del(`crud/${object.route.toLowerCase()}/${object.value.id}`);

    return { deleted: true };
};

export const createFocusedElementsRelation = async ({ commit, state, getters }, object) => {
    getters.focusedElements.forEach((element, index) => {
        if (element[object.route]) {
            const route = pathToRoute(getters.focusedElementsKeys[index]);

            const storedObject = state.api[route].values[element.id];
            const objects = [
                {
                    ...storedObject,
                    [object.route]: [...new Set((storedObject[object.route] || []).concat([object.value.id]))]
                }
            ];

            commit('SETOBJECTS', { route, objects });
        }
    });
};

export const removeFocusedElementsRelation = async ({ commit, state, getters }, object) => {
    getters.focusedElements.forEach((element, index) => {
        if (element[object.route]) {
            const route = pathToRoute(getters.focusedElementsKeys[index]);

            const storedObject = state.api[route].values[element.id];
            const objects = [
                {
                    ...storedObject,
                    [object.route]: storedObject[object.route].filter(id => id !== object.value.id)
                }
            ];

            commit('SETOBJECTS', { route, objects });
        }
    });
};
