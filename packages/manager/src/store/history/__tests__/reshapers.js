import { reshapeHistoryEntry } from '../reshapers';

describe('reshapeHistoryEntry()', () => {
    describe('given a reload History Entry object', () => {
        const dateStr = '2019-01-01T12:00:00';
        const dateObj = new Date(dateStr);

        const entry = {
            amount: 50,
            date: dateStr,
            id: 'id',
            mop: 'card',
            seller: {
                firstname: 'John',
                lastname: 'Doe'
            },
            type: 'reload'
        };
        const res = reshapeHistoryEntry(entry);

        it('returns a reshaped object', () => {
            expect(res).toEqual({
                amount: 50,
                date: dateObj,
                id: 'id',
                meanOfPayment: 'card',
                seller: 'John Doe',
                type: 'reload'
            });
        });
    });

    // it.todo('with all the different types of history entry')
});
