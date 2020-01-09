jest.mock('../../../api', () => ({
    api: {
        post: jest.fn()
    }
}));

import { cardRegister, refund } from '../actions';

const commit = jest.fn();
const dispatch = jest.fn();

describe('cardRegister()', () => {
    describe('given a card registering request', () => {
        const { api } = require('../../../api');

        const location = { href: '' };
        const rootGetters = {
            'wallet/getActiveWallet': { id: 'foo' }
        };

        beforeAll(async () => {
            api.post.mockImplementation(async () => ({
                data: { type: 'url', res: 'http://localhost/' }
            }));

            await cardRegister({ commit, dispatch, rootGetters }, { location });
        });

        it('called the post function with the correct parameters', async () => {
            expect(api.post).toHaveBeenCalledWith('payment/cardRegister', {
                walletId: 'foo'
            });
        });

        it('called all the mutations', () => {
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', true);
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', false);
        });

        it('changed location.href', () => {
            expect(location.href).toBe('http://localhost/');
        });
    });
});

describe('refund()', () => {
    describe('given a refund request', () => {
        const { api } = require('../../../api');

        const rootGetters = {
            'wallet/getActiveWallet': { id: 'foo' }
        };

        const data = { amount: 1000, date: new Date(0).toString() };

        beforeAll(async () => {
            api.post.mockImplementation(async () => ({
                data
            }));

            await refund({ commit, dispatch, rootGetters });
        });

        it('called the post function with the correct parameters', async () => {
            expect(api.post).toHaveBeenCalledWith('payment/accountRefund', {
                wallet_id: 'foo'
            });
        });

        it('called all the mutations', () => {
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', true);
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', false);
        });

        it('called all the actions', () => {
            const actionData = {
                wallet: { id: 'foo' },
                refunds: data
            };

            expect(dispatch).toHaveBeenCalledWith('wallet/updateWalletRefunds', actionData, {
                root: true
            });
        });
    });
});
