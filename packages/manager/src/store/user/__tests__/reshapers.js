import { reshapeUser, reshapeLogin } from '../reshapers';

describe('reshapeUser()', () => {
    describe('given a User object', () => {
        const user = {
            id: 'foo',
            firstname: 'John',
            lastname: 'Doe',
            mail: 'foo@bar.com'
        };
        const res = reshapeUser(user);

        it('returns a reshaped object', () => {
            expect(res).toEqual({
                id: 'foo',
                firstName: 'John',
                lastName: 'Doe',
                fullName: 'John Doe',
                mail: 'foo@bar.com'
            });
        });
    });
});

describe('reshapeLogin()', () => {
    describe('given a Login object', () => {
        const user = {
            id: 'foo',
            firstname: 'John',
            lastname: 'Doe',
            mail: 'foo@bar.com'
        };

        const wallet = {
            id: 'walletId',
            credit: 150,
            physical_id: 'physicalId',
            logical_id: 'logicalId'
        };

        const ticket = { id: 'ticketId', physical_id: 'physicalId' };

        const login = {
            user: {
                ...user,
                wallets: [
                    {
                        ...wallet,
                        ticket
                    }
                ]
            },
            token: 'token'
        };

        const res = reshapeLogin(login);

        it('returns a reshaped object', () => {
            expect(res).toEqual({
                user: {
                    id: 'foo',
                    firstName: 'John',
                    lastName: 'Doe',
                    fullName: 'John Doe',
                    mail: 'foo@bar.com'
                },
                token: 'token',
                wallets: {
                    walletId: {
                        id: 'walletId',
                        credit: 150,
                        logicalId: 'logicalId',
                        physicalId: 'physicalId'
                    }
                },
                tickets: {
                    walletId: {
                        id: 'ticketId',
                        physicalId: 'physicalId'
                    }
                }
            });
        });
    });
});
