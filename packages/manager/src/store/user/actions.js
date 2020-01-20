import { api } from '../../api';
import { humanError } from '../../api/humanError';
import { router } from '../../router';
import { reshapeLogin } from './reshapers';
import * as storage from '../../storage/index';
import { i18n } from '../../locales';

export const login = async ({ commit, dispatch }, { mail, password }) => {
    commit('SET_IS_FETCHING', true);

    try {
        const { data } = await api.post('login', { mail, password });
        const { user, token, wallets, tickets } = reshapeLogin(data);
        const walletIds = Object.keys(wallets);

        commit('SET_USER', user);
        commit('wallet/SET_WALLETS', wallets, { root: true });
        commit('ticket/SET_TICKETS', tickets, { root: true });
        commit('SET_TOKEN', token);

        await dispatch('infos/infos', null, { root: true });

        if (walletIds.length > 0) {
            dispatch('wallet/changeActiveWallet', walletIds[0], { root: true });
        }

        storage.saveUser({ user, token });

        router.push('/dashboard');
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
    } finally {
        commit('SET_IS_FETCHING', false);
    }
};

export const logout = async () => {
    storage.removeUser();

    location.reload();
};

export const restoreSession = async ({ commit, dispatch }) => {
    if (!storage.hasUser()) {
        if (router.currentRoute.meta.auth) {
            router.push('/');
        }

        return;
    }

    const { user, token, wallet } = storage.loadUser();

    commit('SET_USER', user);
    commit('SET_TOKEN', token);

    await dispatch('infos/infos', null, { root: true });

    if (wallet) {
        dispatch('wallet/changeActiveWallet', wallet, { root: true });
    }

    if (router.currentRoute.meta.guest) {
        const route = storage.restoreRoute() || '/dashboard';
        router.push(route);
    }
};

export const forgot = async ({ commit, dispatch }, { mail }) => {
    commit('SET_IS_FETCHING', true);

    try {
        await api.get(`auth/forgot?mail=${mail}`);

        dispatch(
            'notifications/push',
            {
                level: 'success',
                message: i18n.t('store.user.forgotSuccess')
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

export const resetPassword = async ({ commit, dispatch }, { key, password }) => {
    commit('SET_IS_FETCHING', true);

    try {
        await api.put('auth/resetPassword', { key, password });

        dispatch(
            'notifications/push',
            {
                level: 'success',
                message: i18n.t('store.user.resetSuccess')
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

export const changePassword = async (
    { commit, dispatch },
    { currentPassword, password, currentPin, pin }
) => {
    commit('SET_IS_FETCHING', true);

    try {
        await api.put('auth/changePassword', { currentPassword, password, currentPin, pin });

        const message = password
            ? pin
                ? i18n.t('store.user.pinAndPasswordSuccess')
                : i18n.t('store.user.passwordSuccess')
            : i18n.t('store.user.pinSuccess');

        dispatch(
            'notifications/push',
            {
                level: 'success',
                message
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

export const setLanguage = async (_, { language }) => {
    storage.saveLang(language);
    i18n.locale = language;
};
