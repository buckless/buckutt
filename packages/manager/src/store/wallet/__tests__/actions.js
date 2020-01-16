jest.mock('../../../api', () => ({
    api: {
        post: jest.fn(),
        put: jest.fn()
    }
}));

import { updateWalletRefunds, lockWallet, linkSupport } from '../actions';

const commit = jest.fn();
const dispatch = jest.fn();

describe('updateWalletRefunds()', () => {
    describe('given a wallet and a refund content', () => {
        const wallet = { a: 'b', c: 'd', refunds: { foo: 'bar', alice: 'bob' } };
        const refunds = { foo: 'bob', alice: 'bar' };

        beforeAll(async () => {
            await updateWalletRefunds({ commit }, { wallet, refunds });
        });

        it('called the mutation', () => {
            expect(commit).toHaveBeenCalledWith('SET_WALLET', {
                a: 'b',
                c: 'd',
                refunds: { foo: 'bob', alice: 'bar' }
            });
        });
    });
});

describe('lockWallet()', () => {
    describe('when called', () => {
        const { api } = require('../../../api');

        const getters = {
            getActiveWallet: {
                id: 'foo',
                a: 'b',
                blocked: false,
                refunds: { foo: 'bar', alice: 'bob' }
            }
        };

        beforeAll(async () => {
            api.put.mockImplementation(async () => ({ data: { blocked: true } }));

            await lockWallet({ commit, dispatch, getters });
        });

        it('called the put function with the correct parameters', async () => {
            expect(api.put).toHaveBeenCalledWith(`account/block?wallet=foo`);
        });

        it('called all the mutations', () => {
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', true);
            expect(commit).toHaveBeenCalledWith('SET_WALLET', {
                id: 'foo',
                a: 'b',
                blocked: true,
                refunds: { foo: 'bar', alice: 'bob' }
            });
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', false);
        });
    });
});

describe('linkSupport()', () => {
    describe('when called if the user has only a virtual wallet', () => {
        const { api } = require('../../../api');

        const getActiveWallet = {
            id: 'foo',
            physicalId: null,
            logicalId: null
        };

        const getUser = {
            id: 'bar'
        };

        const getters = { getActiveWallet };
        const rootGetters = { 'user/getUser': getUser };

        beforeAll(async () => {
            api.post.mockImplementation(async () => ({
                data: { id: 'foo', physical_id: 'ABCDEF', logical_id: 'bob' }
            }));

            await linkSupport({ commit, dispatch, getters, rootGetters }, { support: 'ABCDEF' });
        });

        it('called the post function with the correct parameters', async () => {
            expect(api.post).toHaveBeenCalledWith('auth/assignWallet', {
                walletId: 'foo',
                physicalId: 'ABCDEF'
            });
        });

        it('called all the mutations', () => {
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', true);
            expect(commit).toHaveBeenCalledWith('SET_WALLET', {
                id: 'foo',
                physicalId: 'ABCDEF',
                logicalId: 'bob'
            });
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', false);
        });

        it('called the infos action', () => {
            expect(dispatch).toHaveBeenCalledWith('infos/infos', null, { root: true });
        });
    });

    describe('when called if the user has already a wallet', () => {
        const { api } = require('../../../api');

        const getActiveWallet = {
            id: 'foo',
            physicalId: 'ABCDEF',
            logicalId: 'bob'
        };

        const getUser = {
            id: 'bar'
        };

        const getters = { getActiveWallet };
        const rootGetters = { 'user/getUser': getUser }

        beforeAll(async () => {
            api.post.mockImplementation(async () => ({
                data: { id: 'foobar', physical_id: 'FOOBAR', logical_id: 'alice' }
            }));

            await linkSupport({ commit, dispatch, getters, rootGetters }, { support: 'FOOBAR' });
        });

        it('called the post function with the correct parameters', async () => {
            expect(api.post).toHaveBeenCalledWith('auth/assignCard', {
                userId: 'bar',
                physicalId: 'FOOBAR'
            });
        });

        it('called all the mutations', () => {
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', true);
            expect(commit).toHaveBeenCalledWith('SET_WALLET', {
                id: 'foobar',
                physicalId: 'FOOBAR',
                logicalId: 'alice'
            });
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', false);
        });

        it('called the infos action', () => {
            expect(dispatch).toHaveBeenCalledWith('infos/infos', null, { root: true });
        });
    });
});
