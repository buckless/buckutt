import { api } from '../../api';
import { humanError } from '../../api/humanError';
import { i18n } from '../../locales';

import { reshapeUserWallets } from './reshapers';

export const transfer = async (
    { commit, dispatch, rootGetters },
    { receiver, amount, physical }
) => {
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
        const { data } = await api.post('payment/transfer', {
            amount: amount * 100,
            debitor_id: activeWallet.id,
            creditor_id: receiver === physical ? undefined : receiver,
            physical_id: receiver === physical ? physical : undefined
        });

        commit('wallet/UPDATE_WALLET_CREDIT', data.newCredit, { root: true });

        dispatch(
            'notifications/push',
            {
                level: 'success',
                message: i18n.t('store.transfer.transferSuccess')
            },
            { root: true }
        );
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

export const searchUsers = async ({ commit, dispatch }, { input }) => {
    commit('SET_IS_FETCHING', true);

    try {
        const { data } = await api.get(`searchuser?name=${input}&limit=10`);

        commit('SET_USER_WALLETS', reshapeUserWallets(data));
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
