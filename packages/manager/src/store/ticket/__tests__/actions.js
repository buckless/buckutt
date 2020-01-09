jest.mock('../../../api', () => ({
    api: {
        post: jest.fn()
    }
}));

import { linkTicket } from '../actions';

const commit = jest.fn();
const dispatch = jest.fn();

describe('linkTicket()', () => {
    describe('when called', () => {
        const { api } = require('../../../api');

        const rootGetters = {
            'wallet/getActiveWallet': {
                id: 'foo'
            }
        };

        beforeAll(async () => {
            api.post.mockImplementation(async () => ({
                data: { id: 'foo', ticket: { id: 'lorem', physical_id: 'ipsum' } }
            }));

            await linkTicket({ commit, dispatch, rootGetters }, { ticket: 'ipsum' });
        });

        it('called the post function with the correct parameters', async () => {
            expect(api.post).toHaveBeenCalledWith('auth/assignWallet', {
                walletId: 'foo',
                ticketNumber: 'ipsum'
            });
        });

        it('called all the mutations', () => {
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', true);
            expect(commit).toHaveBeenCalledWith('SET_TICKET', {
                id: 'lorem',
                physicalId: 'ipsum'
            });
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', false);
        });
    });
});
