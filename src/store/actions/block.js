import { put } from '../../lib/fetch';

export const block = ({ commit }) => {
    if (!window.confirm('Êtes-vous sûr de vouloir bloquer votre carte ?')) {
        return;
    }

    put('block')
        .then(() => commit('BLOCK_CARDS'))
        .catch(() => window.alert('Impossible de bloquer votre carte'));
};
