jest.mock('../../../api', () => ({
    api: {
        get: jest.fn()
    }
}));

import { infos } from '../actions';

const commit = jest.fn();
const dispatch = jest.fn();

describe('infos()', () => {
    describe('when called', () => {
        const { api } = require('../../../api');

        const giftReloads = [{ amount: 1000 }];
        const paymentCosts = [{ amount: 2000 }];
        const meansOfPayment = [{ slug: 'foo', name: 'Bar' }];

        const reloads = { start: Date.now() - 4000, end: Date.now() - 1000 };
        const wallets = [
            { id: 'a', ticket: { id: 'T-A' }, refunds: { foo: 'bar' } },
            { id: 'b', ticket: { id: 'T-B' }, refunds: { foo: 'bar' } }
        ];

        beforeAll(async () => {
            api.get.mockImplementation(async () => ({
                data: { giftReloads, paymentCosts, meansOfPayment, reloads, wallets }
            }));

            await infos({ commit, dispatch });
        });

        it('called the get function with the correct parameters', async () => {
            expect(api.get).toHaveBeenCalledWith('auth/infos');
        });

        it('called all the mutations', () => {
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', true);
            expect(commit).toHaveBeenCalledWith(
                'wallet/SET_WALLETS',
                {
                    a: { id: 'a', refunds: { foo: 'bar' } },
                    b: { id: 'b', refunds: { foo: 'bar' } }
                },
                { root: true }
            );
            expect(commit).toHaveBeenCalledWith('SET_GIFT_RELOADS', giftReloads);
            expect(commit).toHaveBeenCalledWith('SET_PAYMENT_COSTS', paymentCosts);
            expect(commit).toHaveBeenCalledWith('SET_MEANS_OF_PAYMENT', { foo: 'Bar' });
            expect(commit).toHaveBeenCalledWith('SET_RELOAD_ALLOWED', false);
            expect(commit).toHaveBeenCalledWith(
                'ticket/SET_TICKETS',
                {
                    a: { id: 'T-A' },
                    b: { id: 'T-B' }
                },
                { root: true }
            );
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', false);
        });
    });
});
