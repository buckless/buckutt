import { reshapeCardRegister } from '../reshapers';

describe('reshapeCardRegister()', () => {
    describe('given a CardRegister object', () => {
        const reload = { type: 'url', res: 'http://localhost' };
        const res = reshapeCardRegister(reload);

        it('returns a reshaped object', () => {
            expect(res).toEqual({
                outcome: 'success',
                type: 'url',
                data: {
                    nextUrl: 'http://localhost'
                }
            });
        });
    });
});
