import { api } from '../../api';
import { humanError } from '../../api/humanError';
import { reshapeWallet } from './reshapers';
import { i18n } from '../../locales';

export const updateWalletRefunds = async ({ commit }, { wallet, refunds }) => {
    commit('SET_WALLET', {
        ...wallet,
        refunds
    });
};

export const lockWallet = async ({ commit, dispatch, getters }) => {
    commit('SET_IS_FETCHING', true);

    const wallet = getters.getActiveWallet;

    try {
        await api.put(`account/block?wallet=${wallet.id}`);

        commit('SET_WALLET', {
            ...wallet,
            blocked: true
        });

        dispatch(
            'notifications/push',
            {
                level: 'success',
                message: i18n.t('store.wallet.lockSuccess')
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

export const linkSupport = async ({ commit, dispatch, getters }, { support }) => {
    commit('SET_IS_FETCHING', true);

    const wallet = getters.getActiveWallet;
    const user = getters.getUser;

    let route, body;

    if (!wallet.logicalId) {
        body = {
            walletId: wallet.id,
            physicalId: support
        };

        route = 'auth/assignWallet';
    } else {
        body = {
            physicalId: support,
            userId: user.id
        };

        route = 'auth/assignCard';
    }

    try {
        const { data } = await api.post(route, body);

        commit('SET_WALLET', reshapeWallet(data));

        await dispatch('infos/infos', null, { root: true });

        await dispatch('changeActiveWallet', data);

        dispatch(
            'notifications/push',
            {
                level: 'success',
                message: i18n.t('store.wallet.linkSuccess')
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

export const changeActiveWallet = async ({ commit, dispatch }, { id }) => {
    commit('SET_ACTIVE_WALLET', id);
    await dispatch('history/load', null, { root: true });
};
