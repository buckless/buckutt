import { reshapeTicket } from '../reshapers';

describe('reshapeTicket()', () => {
    describe('given a Ticket object', () => {
        const ticket = { id: 'id', physical_id: 'physicalId' };
        const res = reshapeTicket(ticket);

        it('returns a reshaped object', () => {
            expect(res).toEqual({
                id: 'id',
                physicalId: 'physicalId'
            });
        });
    });
});
