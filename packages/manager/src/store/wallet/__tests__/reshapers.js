import { reshapeWallet } from '../reshapers';

describe('reshapeWallet()', () => {
    describe('given a Wallet object', () => {
        const wallet = {
            id: 'id',
            credit: 150,
            logical_id: 'logicalId',
            physical_id: 'physicalId',
            blocked: false
        };
        const res = reshapeWallet(wallet);

        it('returns a reshaped object', () => {
            expect(res).toEqual({
                id: 'id',
                credit: 150,
                logicalId: 'logicalId',
                physicalId: 'physicalId',
                blocked: false
            });
        });
    });
});
