import { reshapeUserWallet, reshapeUserWallets } from '../reshapers';

describe('reshapeUserWallet()', () => {
    describe('given a userWallet object with a physicalId', () => {
        const userWallet = {
            lastname: 'Foo',
            firstname: 'Bar',
            wallet: {
                id: 'foobar',
                physical_id: 'ABCDEF'
            }
        };

        const res = reshapeUserWallet(userWallet);

        it('returns a reshaped object', () => {
            expect(res).toEqual({
                id: 'foobar',
                label: 'Bar Foo (ABCDEF)',
                section: 'users'
            });
        });
    });

    describe('given a userWallet object without a physicalId', () => {
        const userWallet = {
            lastname: 'Foo',
            firstname: 'Bar',
            wallet: {
                id: 'foobar'
            }
        };

        const res = reshapeUserWallet(userWallet);

        it('returns a reshaped object', () => {
            expect(res).toEqual({
                id: 'foobar',
                label: 'Bar Foo',
                section: 'users'
            });
        });
    });
});

describe('reshapeUserWallets()', () => {
    describe('given a userWallets array', () => {
        const userWallets = [
            {
                lastname: 'Foo',
                firstname: 'Bar',
                wallets: [
                    {
                        id: 'foobar',
                        physical_id: 'ABCDEF'
                    },
                    {
                        id: 'barfoo',
                        physical_id: 'BARFOO'
                    }
                ]
            },
            {
                lastname: 'Bob',
                firstname: 'Alice',
                wallets: [
                    {
                        id: 'alicebob'
                    }
                ]
            }
        ];

        const res = reshapeUserWallets(userWallets);

        it('returns a reshaped object', () => {
            expect(res).toEqual([
                {
                    id: 'foobar',
                    label: 'Bar Foo (ABCDEF)',
                    section: 'users'
                },
                {
                    id: 'barfoo',
                    label: 'Bar Foo (BARFOO)',
                    section: 'users'
                },
                {
                    id: 'alicebob',
                    label: 'Alice Bob',
                    section: 'users'
                }
            ]);
        });
    });
});
