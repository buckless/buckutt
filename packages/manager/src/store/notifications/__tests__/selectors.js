import { getNotifications } from '../selectors';

describe('getNotifications()', () => {
    describe('given a state containing queue containing notifications', () => {
        const state = {
            queue: {
                a: { id: 'a' },
                b: { id: 'b' }
            }
        };

        const res = getNotifications(state);

        it('returns the notifications as an array', () => {
            expect(res).toEqual([state.queue.a, state.queue.b]);
        });
    });
});
