jest.mock('../../../api', () => ({
    api: {
        get: jest.fn(),
        post: jest.fn()
    }
}));

import { transfer, searchUsers } from '../actions';

const commit = jest.fn();
const dispatch = jest.fn();

describe('transfer()', () => {
    describe('given an amount and a receiverId different than the physicalId', () => {
        const receiver = 'receiverId';
        const physical = 'physicalId';
        const amount = 10;

        const { api } = require('../../../api');

        const rootGetters = { 'wallet/getActiveWallet': { id: 'foo' } };

        beforeAll(async () => {
            api.post.mockImplementation(async () => ({
                data: { newCredit: 0 }
            }));

            await transfer({ commit, dispatch, rootGetters }, { receiver, amount, physical });
        });

        it('called the post function with the correct parameters', async () => {
            expect(api.post).toHaveBeenCalledWith('payment/transfer', {
                amount: 1000,
                creditor_id: 'receiverId',
                debitor_id: 'foo'
            });
        });

        it('called all the mutations', () => {
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', true);
            expect(commit).toHaveBeenCalledWith('wallet/UPDATE_WALLET_CREDIT', 0, { root: true });
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', false);
        });
    });

    describe('given an amount and a receiverId equal to the physicalId', () => {
        const receiver = 'physicalId';
        const physical = 'physicalId';
        const amount = 10;

        const { api } = require('../../../api');

        const rootGetters = { 'wallet/getActiveWallet': { id: 'foo' } };

        beforeAll(async () => {
            api.post.mockImplementation(async () => ({
                data: { newCredit: 0 }
            }));

            await transfer({ commit, dispatch, rootGetters }, { receiver, amount, physical });
        });

        it('called the post function with the correct parameters', async () => {
            expect(api.post).toHaveBeenCalledWith('payment/transfer', {
                amount: 1000,
                physical_id: 'physicalId',
                debitor_id: 'foo'
            });
        });

        it('called all the mutations', () => {
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', true);
            expect(commit).toHaveBeenCalledWith('wallet/UPDATE_WALLET_CREDIT', 0, { root: true });
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', false);
        });
    });
});

describe('searhUsers()', () => {
    describe('given a name input', () => {
        const input = 'foo';

        const { api } = require('../../../api');

        beforeAll(async () => {
            api.get.mockImplementation(async () => ({
                data: [
                    {
                        firstname: 'Foo',
                        lastname: 'Bar',
                        wallets: [{ id: 'foobar', physical_id: 'FOOBAR' }]
                    }
                ]
            }));

            await searchUsers({ commit, dispatch }, { input });
        });

        it('called the get function with the correct parameters', async () => {
            expect(api.get).toHaveBeenCalledWith('searchuser?name=foo&limit=10');
        });

        it('called all the mutations', () => {
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', true);
            expect(commit).toHaveBeenCalledWith('SET_USER_WALLETS', [
                { id: 'foobar', label: 'Foo Bar (FOOBAR)', section: 'users' }
            ]);
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', false);
        });
    });
});
