import { models } from '@/lib/normalize';
import { post, del } from '@/lib/fetch';

export const createRelation = async ({ commit, state }, relation) => {
    const obj1 = relation.obj1;
    const obj2 = relation.obj2;

    await post(`crud/${obj1.route}/${obj1.value.id}/${obj2.route}/${obj2.value.id}`);

    if (models[obj1.route].schema[obj2.route]) {
        const storedObj1 = state.api[obj1.route].values[obj1.value.id];
        const objects = [
            {
                ...storedObj1,
                [obj2.route]: [...new Set((storedObj1[obj2.route] || []).concat([obj2.value.id]))]
            }
        ];

        commit('SETOBJECTS', { route: obj1.route, objects });
    }

    if (models[obj2.route].schema[obj1.route]) {
        const storedObj2 = state.api[obj2.route].values[obj2.value.id];
        const objects = [
            {
                ...storedObj2,
                [obj1.route]: [...new Set((storedObj2[obj1.route] || []).concat([obj1.value.id]))]
            }
        ];

        commit('SETOBJECTS', { route: obj2.route, objects });
    }
};

export const removeRelation = async ({ commit, state }, relation) => {
    const obj1 = relation.obj1;
    const obj2 = relation.obj2;

    await del(`crud/${obj1.route}/${obj1.value.id}/${obj2.route}/${obj2.value.id}`);

    if (models[obj1.route].schema[obj2.route]) {
        const storedObj1 = state.api[obj1.route].values[obj1.value.id];
        const objects = [
            {
                ...storedObj1,
                [obj2.route]: storedObj1[obj2.route].filter(id => id !== obj2.value.id)
            }
        ];

        commit('SETOBJECTS', { route: obj1.route, objects });
    }

    if (models[obj2.route].schema[obj1.route]) {
        const storedObj2 = state.api[obj2.route].values[obj2.value.id];
        const objects = [
            {
                ...storedObj2,
                [obj1.route]: storedObj2[obj1.route].filter(id => id !== obj1.value.id)
            }
        ];

        commit('SETOBJECTS', { route: obj2.route, objects });
    }
};
