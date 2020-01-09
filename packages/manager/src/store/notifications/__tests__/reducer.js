import { reducer } from '../reducer';

jest.mock('vue', () => ({
    set: (item, key, value) => {
        item[key] = value;
    }
}));

// FIXME: not supported yet
Object.fromEntries = entries =>
    entries.reduce(
        (acc, entry) => ({
            ...acc,
            [entry[0]]: entry[1]
        }),
        {}
    );

describe('CLEAR()', () => {
    describe('given a state containing a queue containing multiple elements', () => {
        const state = {
            queue: {
                a: 'foo',
                b: 'bar',
                c: 'baz'
            }
        };

        describe('when called with b', () => {
            reducer.CLEAR(state, 'b');

            it('removed the notification from the queue', () => {
                expect(state.queue).toEqual({
                    a: 'foo',
                    c: 'baz'
                });
            });
        });
    });
});

describe('PUSH()', () => {
    describe('given a state containing an empty queue', () => {
        const state = {
            queue: {}
        };

        describe('when called with an object', () => {
            reducer.PUSH(state, { id: 'b' });

            it('added the object to the queue', () => {
                expect(state.queue).toEqual({
                    b: { id: 'b' }
                });
            });
        });
    });
});
