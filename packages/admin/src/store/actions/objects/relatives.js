import cloneDeep from 'lodash.clonedeep';
import { post, del } from '../../../lib/fetch';

export function createRelation({ dispatch, state }, relation) {
    const body = {};

    if (relation.through) {
        body[relation.through.field] = relation.through.value.id;
    }

    const obj1 = relation.obj1;
    const obj2 = relation.obj2;

    return post(`crud/${obj1.route}/${obj1.value.id}/${obj2.route}/${obj2.value.id}`, body).then(
        () => {
            const updatedFocusedElement1 = state.app.focusedElements.findIndex(
                element => element.id === obj1.value.id && element[obj2.route]
            );
            const updatedFocusedElement2 = state.app.focusedElements.findIndex(
                element => element.id === obj2.value.id && element[obj1.route]
            );

            if (updatedFocusedElement1 > -1) {
                const obj2Clone = cloneDeep(obj2.value);

                dispatch('updateFocusedElement', {
                    depth: updatedFocusedElement1,
                    newRelation: obj2.route,
                    value: obj2Clone
                });
            }

            if (updatedFocusedElement2 > -1) {
                const obj1Clone = cloneDeep(obj1.value);

                dispatch('updateFocusedElement', {
                    depth: updatedFocusedElement2,
                    newRelation: obj1.route,
                    value: obj1Clone
                });
            }
        }
    );
}

export function removeRelation({ dispatch, state }, relation) {
    const obj1 = relation.obj1;
    const obj2 = relation.obj2;

    return del(`crud/${obj1.route}/${obj1.value.id}/${obj2.route}/${obj2.value.id}`).then(() => {
        const updatedFocusedElement1 = state.app.focusedElements.findIndex(
            element => element.id === obj1.value.id && element[obj2.route]
        );
        const updatedFocusedElement2 = state.app.focusedElements.findIndex(
            element => element.id === obj2.value.id && element[obj1.route]
        );

        if (updatedFocusedElement1 > -1) {
            dispatch('updateFocusedElement', {
                depth: updatedFocusedElement1,
                delRelation: obj2.route,
                value: obj2.value
            });
        }

        if (updatedFocusedElement2 > -1) {
            dispatch('updateFocusedElement', {
                depth: updatedFocusedElement2,
                delRelation: obj1.route,
                value: obj1.value
            });
        }
    });
}
