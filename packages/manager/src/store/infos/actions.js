import { api } from '../../api';
import { humanError } from '../../api/humanError';
import { reshapeInfos } from './reshapers';
import { i18n } from '../../locales';

export const infos = async ({ commit, dispatch }) => {
    commit('SET_IS_FETCHING', true);

    try {
        const { data } = await api.get('auth/infos');

        // eslint-disable-next-line no-console
        const {
            giftReloads,
            meansOfPayment,
            paymentCosts,
            reloadAllowed,
            wallets,
            tickets
        } = reshapeInfos(data);

        commit('wallet/SET_WALLETS', wallets, { root: true });
        commit('SET_GIFT_RELOADS', giftReloads);
        commit('SET_PAYMENT_COSTS', paymentCosts);
        commit('SET_MEANS_OF_PAYMENT', meansOfPayment);
        commit('SET_RELOAD_ALLOWED', reloadAllowed);
        commit('ticket/SET_TICKETS', tickets, { root: true });

        dispatch('history/load', null, { root: true });
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
