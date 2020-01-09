import { api } from '../../api';
import { humanError } from '../../api/humanError';
import { reshapeHistory } from './reshapers';
import { i18n } from '../../locales';

export const load = async ({ commit, dispatch, rootGetters }) => {
    const activeWallet = rootGetters['wallet/getActiveWallet'];

    if (!activeWallet) {
        dispatch(
            'notifications/push',
            {
                level: 'error',
                message: i18n.t('errors.common')
            },
            { root: true }
        );
        return;
    }

    commit('SET_IS_FETCHING', true);

    try {
        const { data } = await api.get('account/history', {
            params: {
                wallet: activeWallet.id
            }
        });

        const { history, walletCredit, pending } = reshapeHistory(data);

        commit('SET_HISTORY', history);
        commit('SET_PENDING', pending);
        commit('wallet/UPDATE_WALLET_CREDIT', walletCredit, { root: true });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);

        if (err.response) {
            const message = err.response.data.message;

            dispatch(
                'notifications/push',
                {
                    level: 'error',
                    message: humanError(message)
                },
                { root: true }
            );

            return false;
        }

        dispatch(
            'notifications/push',
            {
                level: 'error',
                message: i18n.t('errors.common')
            },
            { root: true }
        );
    } finally {
        commit('SET_IS_FETCHING', false);
    }
};
