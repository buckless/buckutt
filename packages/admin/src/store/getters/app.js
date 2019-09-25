import { denormalize } from 'normalizr';
import pathToRoute from '@/lib/pathToRoute';
import { models } from '@/lib/normalize';

export const entities = state => {
    const entities = {};
    Object.keys(state.api).forEach(entity => {
        entities[entity] = state.api[entity].values;
    });

    return entities;
};

export const focusedElementsKeys = state => Object.keys(state.route.params);

export const focusedElements = (state, getters) =>
    Object.keys(state.route.params).map(
        key =>
            denormalize(
                state.api[pathToRoute(key)].values[state.route.params[key]],
                models[pathToRoute(key)],
                getters.entities
            ) || {}
    );

export const getApiObjects = (state, getters) => model =>
    state.api[model].allIds.map(id =>
        denormalize(state.api[model].values[id], models[model], getters.entities)
    );

export const logged = state => !!state.app.loggedUser;
export const event = (_, getters) => getters.getApiObjects('events')[0];
export const internetPoint = state =>
    Object.values(state.api.points.values).find(point => point.name === 'Internet');
