import { push } from '../actions';
import { wait } from '../../../utils/wait';

const commit = jest.fn();

describe('push()', () => {
    describe('given a notification object', () => {
        const notif = { level: 'level', message: 'message', timeout: 1 };

        push({ commit }, notif);

        it('pushes it to the queue', async () => {
            expect(commit).toHaveBeenCalledWith('PUSH', {
                id: 'notification-0',
                message: notif.message,
                level: notif.level
            });

            await wait(10);

            expect(commit).toHaveBeenCalledWith('CLEAR', 'notification-0');
        });
    });
});
