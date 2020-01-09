import { generate } from '../../utils/uniqid';

export const push = ({ commit }, { level, message, timeout = 4000 }) => {
    const id = generate('notification');

    commit('PUSH', {
        id,
        level,
        message
    });

    setTimeout(() => commit('CLEAR', id), timeout);
};
