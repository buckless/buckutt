jest.mock('../../../api', () => ({
    api: {
        get: jest.fn()
    }
}));

import { load } from '../actions';

const commit = jest.fn();
const dispatch = jest.fn();

describe('history()', () => {
    describe('when called', () => {
        const { api } = require('../../../api');
        const dateStr = '2019-01-01T12:00:00';
        const dateObj = new Date(dateStr);

        const rootGetters = { 'wallet/getActiveWallet': { id: 'foo' } };
        const history = [
            {
                amount: 10000,
                date: dateStr,
                id: 'id',
                mop: 'card',
                seller: {
                    firstname: 'John',
                    lastname: 'Doe'
                },
                type: 'reload'
            }
        ];
        const pending = 10000;
        const wallet = { credit: 10000 };

        api.get.mockImplementation(async () => ({
            data: { history, pending, wallet }
        }));

        beforeAll(async () => {
            await load({ commit, dispatch, rootGetters });
        });

        it('called the post function with the correct parameters', async () => {
            expect(api.get).toHaveBeenCalledWith('account/history', {
                params: {
                    wallet: 'foo'
                }
            });
        });

        it('called all the mutations', () => {
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', true);
            expect(commit).toHaveBeenCalledWith('SET_HISTORY', [
                {
                    amount: 10000,
                    date: dateObj,
                    id: 'id',
                    meanOfPayment: 'card',
                    seller: 'John Doe',
                    type: 'reload'
                }
            ]);
            expect(commit).toHaveBeenCalledWith('SET_PENDING', 10000);
            expect(commit).toHaveBeenCalledWith('wallet/UPDATE_WALLET_CREDIT', 10000, {
                root: true
            });
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', false);
        });
    });
});
