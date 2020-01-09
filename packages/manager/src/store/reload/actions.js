import { api } from '../../api';
import { humanError } from '../../api/humanError';
import { reshapeReload, reshapeAmount } from './reshapers';
import { i18n } from '../../locales';

export const reload = async (
    { commit, dispatch, rootGetters },
    { amount, location = window.location }
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
        const paymentCosts = rootGetters['infos/getPaymentCosts'];
        const reshapedAmount = reshapeAmount(amount, paymentCosts);

        const { data } = await api.post('payment/reload', {
            amount: reshapedAmount,
            walletId: activeWallet.id
        });
        const {
            outcome,
            type,
            data: { nextUrl }
        } = reshapeReload(data);

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

export const callback = async (_, { token }) =>
    api.get(`provider/callback?token=${token}&isNotification=1`);
