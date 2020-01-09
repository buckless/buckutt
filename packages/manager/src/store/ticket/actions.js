import { api } from '../../api';
import { humanError } from '../../api/humanError';
import { reshapeTicket } from './reshapers';
import { i18n } from '../../locales';

export const linkTicket = async ({ commit, dispatch, rootGetters }, { ticket }) => {
    commit('SET_IS_FETCHING', true);

    const wallet = rootGetters['wallet/getActiveWallet'];

    try {
        const { data } = await api.post('auth/assignWallet', {
            walletId: wallet.id,
            ticketNumber: ticket
        });

        commit('SET_TICKET', reshapeTicket(data.ticket));

        dispatch(
            'notifications/push',
            {
                level: 'success',
                message: i18n.t('store.ticket.linkSuccess')
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
