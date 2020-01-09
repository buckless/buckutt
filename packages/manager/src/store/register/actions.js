import { api } from '../../api';
import { humanError } from '../../api/humanError';
import { i18n } from '../../locales';

export const submitUserInfos = async ({ commit }, { mail, firstName, lastName, password }) => {
    commit('SET_STEP', 'card');
    commit('SET_MAIL', mail);
    commit('SET_FIRST_NAME', firstName);
    commit('SET_LAST_NAME', lastName);
    commit('SET_PASSWORD', password);
};

export const submitCardInfos = async ({ commit }, { physicalId }) => {
    commit('SET_STEP', 'ticket');
    commit('SET_PHYSICAL_ID', physicalId);
};

export const submitTicketInfos = async ({ commit }, { ticketNumber }) => {
    commit('SET_TICKET_NUMBER', ticketNumber);
};

export const register = async ({ commit, dispatch, getters }) => {
    const formData = getters.getRegisterFormData;

    commit('SET_IS_FETCHING', true);

    try {
        await api.post('auth/register', formData);

        commit('SET_STEP', 'success');
        commit('SET_IS_FETCHING', false);

        return true;
    } catch (err) {
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

        return false;
    } finally {
        commit('SET_IS_FETCHING', false);
    }
};
