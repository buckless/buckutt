import { api } from '../../api';
import * as storage from '../../storage/index';
import { humanError } from '../../api/humanError';
import { reshapeWallet } from './reshapers';
import { i18n } from '../../locales';

let source;

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

export const linkSupport = async ({ commit, dispatch, getters, rootGetters }, { support }) => {
    commit('SET_IS_FETCHING', true);

    const wallet = getters.getActiveWallet;
    const user = rootGetters['user/getUser'];

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

        await dispatch('changeActiveWallet', data.id);

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

export const changeActiveWallet = async ({ commit, dispatch }, id) => {
    commit('SET_ACTIVE_WALLET', id);
    storage.saveUser({ wallet: id });
    dispatch('listenCredit');
    await dispatch('history/load', null, { root: true });
};

export const listenCredit = async({ state, commit, dispatch, getters, rootGetters }) => {
    if (source) {
        source.close();
    }

    const wallet = getters.getActiveWallet;
    const token = rootGetters['user/getToken'];

    source = new EventSource(
        `/live/credit?authorization=Bearer ${token}&handshake-interval=10000&lastEventId=12345&retry=3000&wallet=${wallet.id}`
    );

    source.addEventListener('message', e => {
        const { credit, pending } = JSON.parse(e.data);

        if (typeof credit === 'number') {
            commit('UPDATE_WALLET_CREDIT', credit);
        }

        if (typeof pending === 'number') {
            commit('history/SET_PENDING', pending, { root: true });
        }
        
        dispatch('history/load', null, { root: true });
    });
};
