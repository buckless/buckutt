jest.mock('../../../api', () => ({
    api: {
        get: jest.fn(),
        post: jest.fn()
    }
}));

import { reload, callback } from '../actions';

const commit = jest.fn();
const dispatch = jest.fn();

describe('reload()', () => {
    describe('given an amount', () => {
        const amount = 1000;

        const { api } = require('../../../api');

        const location = { href: '' };
        const rootGetters = {
            'wallet/getActiveWallet': { id: 'foo' },
            'infos/getPaymentCosts': { fixedCostsReload: 25, variableCostsReload: 1 }
        };

        api.post.mockImplementation(async () => ({
            data: { type: 'url', res: 'http://localhost/' }
        }));

        beforeAll(async () => {
            await reload({ commit, dispatch, rootGetters }, { amount, location });
        });

        it('called the post function with the correct parameters', async () => {
            expect(api.post).toHaveBeenCalledWith('payment/reload', {
                amount: 1035,
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

describe('callback()', () => {
    describe('given a token', () => {
        const token = 'foo';

        const { api } = require('../../../api');

        beforeAll(async () => {
            await callback({}, { token });
        });

        it('called the get function with the correct parameters', async () => {
            expect(api.get).toHaveBeenCalledWith('provider/callback?token=foo&isNotification=1');
        });
    });
});
