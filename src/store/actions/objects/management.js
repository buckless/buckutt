import { post, put, del } from '../../../lib/fetch';
import routeToRelation from '../../../lib/routeToRelation';

/**
 * App actions
 */

export function clearAppStore({ commit }) {
    commit('CLEARAPPSTORE');
}

export function clearObject({ commit }, route) {
    commit('CLEAROBJECT', route);
}

export function checkAndAddObjects({ commit, dispatch, state }, data) {
    if (state.objects[data.route]) {
        const objectsToAdd = data.objects.filter(
            object => state.objects[data.route].findIndex(o => o.id === object.id) === -1
        );

        if (objectsToAdd.length > 0) {
            commit('ADDOBJECTS', { route: data.route, objects: objectsToAdd });
        }

        dispatch('checkAndUpdateObjects', {
            route: data.route,
            objects: data.objects.filter(
                object => state.objects[data.route].findIndex(o => o.id === object.id) !== -1
            ),
            forceUpdate: true
        });
    }
}

export function checkAndUpdateObjects({ commit, state }, data) {
    if (state.objects[data.route]) {
        const objects = data.objects.filter(object => {
            const foundObject = state.objects[data.route].find(o => o.id === object.id);

            if (foundObject) {
                return (
                    foundObject.updated_at !== object.updated_at ||
                    (data.forceUpdate && JSON.stringify(foundObject) !== JSON.stringify(object))
                );
            }

            return false;
        });

        if (objects.length > 0) {
            commit('UPDATEOBJECTS', { route: data.route, objects });
        }
    }
}

export function checkAndDeleteObjects({ commit, state }, data) {
    if (state.objects[data.route]) {
        const objects = data.objects.filter(object =>
            state.objects[data.route].find(o => o.id === object.id)
        );

        if (objects.length > 0) {
            commit('DELETEOBJECTS', { route: data.route, objects });
        }
    }
}

export function createObject({ dispatch, state }, object) {
    let embed = '';

    if (routeToRelation(object.route)) {
        embed = `?embed=${routeToRelation(object.route)}`;
    }

    return post(`crud/${object.route.toLowerCase()}${embed}`, object.value).then(result => {
        if (state.objects[object.route]) {
            dispatch('checkAndAddObjects', {
                route: object.route,
                objects: [result]
            });
        }

        state.app.focusedElements.forEach((element, depth) => {
            if (
                element[object.route] &&
                Object.values(result).some(value => value === element.id)
            ) {
                dispatch('updateFocusedElement', {
                    depth,
                    newRelation: object.route,
                    value: result,
                    saveInStore: true
                });
            }
        });

        return result;
    });
}

export function updateObject({ dispatch, state }, object) {
    let embed = '';

    if (routeToRelation(object.route)) {
        embed = `?embed=${routeToRelation(object.route)}`;
    }

    return put(`crud/${object.route.toLowerCase()}/${object.value.id}${embed}`, object.value).then(
        result => {
            dispatch('checkAndUpdateObjects', {
                route: object.route,
                objects: [result]
            });

            state.app.focusedElements.forEach((element, depth) => {
                if (element[object.route]) {
                    dispatch('updateFocusedElement', {
                        depth,
                        relation: object.route,
                        value: result,
                        saveInStore: true
                    });
                }
            });

            return result;
        }
    );
}

export function removeObject({ dispatch, state }, object) {
    return del(`crud/${object.route.toLowerCase()}/${object.value.id}`).then(() => {
        dispatch('checkAndDeleteObjects', {
            route: object.route,
            objects: [object.value]
        });

        state.app.focusedElements.forEach((element, depth) => {
            if (element[object.route]) {
                dispatch('updateFocusedElement', {
                    depth,
                    delRelation: object.route,
                    value: object.value,
                    saveInStore: true
                });
            }
        });

        return { deleted: true };
    });
}
