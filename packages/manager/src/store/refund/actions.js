import { api } from '../../api';
import { humanError } from '../../api/humanError';
import { reshapeCardRegister } from './reshapers';
import { i18n } from '../../locales';

export const cardRegister = async (
    { commit, dispatch, rootGetters },
    { location = window.location }
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
        const { data } = await api.post('payment/cardRegister', {
            walletId: activeWallet.id
        });

        const {
            outcome,
            type,
            data: { nextUrl }
        } = reshapeCardRegister(data);

        if (outcome === 'success' && type === 'url') {
            location.href = nextUrl;
        }
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

export const refund = async ({ commit, dispatch, rootGetters }) => {
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
        const { data } = await api.post('payment/accountRefund', {
            wallet_id: activeWallet.id
        });

        await dispatch(
            'wallet/updateWalletRefunds',
            { wallet: activeWallet, refunds: data },
            { root: true }
        );

        dispatch(
            'notifications/push',
            {
                level: 'success',
                message: i18n.t('store.refund.requestSuccess')
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
