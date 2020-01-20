jest.mock('../../../api', () => ({
    api: {
        post: jest.fn(),
        get: jest.fn(),
        put: jest.fn()
    }
}));

jest.mock('../../../storage', () => ({
    saveUser: jest.fn(),
    hasUser: jest.fn(),
    loadUser: jest.fn(),
    saveLang: jest.fn(),
    loadLang: () => 'en'
}));

jest.mock('../../../router', () => ({
    router: {
        push: jest.fn()
    }
}));

import { login, forgot, resetPassword, changePassword, setLanguage } from '../actions';

const commit = jest.fn();
const dispatch = jest.fn();

describe('login()', () => {
    describe('given a mail and a password', () => {
        const mail = 'admin@buckless.com';
        const password = 'password';

        const wallets = [{ id: 'a', ticket: { id: 'T-A' } }, { id: 'b', ticket: { id: 'T-B' } }];
        const user = { firstname: 'a', lastname: 'b', mail, wallets };
        const token = 'token';

        const { api } = require('../../../api');

        const { saveUser } = require('../../../storage');

        beforeAll(async () => {
            api.post.mockImplementation(async () => ({ data: { user, token } }));

            await login({ commit, dispatch }, { mail, password });
        });

        it('called the post function with the correct parameters', async () => {
            expect(api.post).toHaveBeenCalledWith('login', { mail, password });
        });

        it('called all the mutations', () => {
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', true);
            expect(commit).toHaveBeenCalledWith('SET_USER', {
                firstName: 'a',
                lastName: 'b',
                fullName: 'a b',
                mail
            });
            expect(commit).toHaveBeenCalledWith(
                'wallet/SET_WALLETS',
                { a: { id: 'a' }, b: { id: 'b' } },
                { root: true }
            );
            expect(commit).toHaveBeenCalledWith(
                'ticket/SET_TICKETS',
                {
                    a: { id: 'T-A' },
                    b: { id: 'T-B' }
                },
                { root: true }
            );
            expect(commit).toHaveBeenCalledWith('SET_TOKEN', token);
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', false);
        });

        it('called all the actions', () => {
            expect(dispatch).toHaveBeenCalledWith('infos/infos', null, { root: true });
            expect(dispatch).toHaveBeenCalledWith('wallet/changeActiveWallet', 'a', { root: true });
        });

        it('called the storage method saveUser', () => {
            expect(saveUser).toHaveBeenCalledWith({
                user: {
                    firstName: 'a',
                    lastName: 'b',
                    fullName: 'a b',
                    mail
                },
                token: 'token'
            });
        });
    });
});

describe('forgot()', () => {
    describe('when called', () => {
        const { api } = require('../../../api');

        beforeAll(async () => {
            api.get.mockImplementation(async () => Promise.resolve());

            await forgot({ commit, dispatch }, { mail: 'foo@buckless.com' });
        });

        it('called the post function with the correct parameters', async () => {
            expect(api.get).toHaveBeenCalledWith('auth/forgot?mail=foo@buckless.com');
        });

        it('called all the mutations', () => {
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', true);
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', false);
        });
    });
});

describe('resetPassword()', () => {
    describe('when called', () => {
        const { api } = require('../../../api');

        beforeAll(async () => {
            api.put.mockImplementation(async () => Promise.resolve());

            await resetPassword({ commit, dispatch }, { password: 'foo', key: 'bar' });
        });

        it('called the post function with the correct parameters', async () => {
            expect(api.put).toHaveBeenCalledWith('auth/resetPassword', {
                password: 'foo',
                key: 'bar'
            });
        });

        it('called all the mutations', () => {
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', true);
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', false);
        });
    });
});

describe('changePassword()', () => {
    describe('when called', () => {
        const { api } = require('../../../api');

        beforeAll(async () => {
            api.put.mockImplementation(async () => Promise.resolve());

            await changePassword(
                { commit, dispatch },
                { password: 'foo', currentPassword: 'bar', pin: '1234', currentPin: '0000' }
            );
        });

        it('called the post function with the correct parameters', async () => {
            expect(api.put).toHaveBeenCalledWith('auth/changePassword', {
                password: 'foo',
                currentPassword: 'bar',
                pin: '1234',
                currentPin: '0000'
            });
        });

        it('called all the mutations', () => {
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', true);
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', false);
        });
    });
});

describe('setLanguage()', () => {
    describe('when called', () => {
        const { saveLang } = require('../../../storage');

        beforeAll(async () => {
            await setLanguage({}, { language: 'fr' });
        });

        it('called the storage method saveLang', async () => {
            expect(saveLang).toHaveBeenCalledWith('fr');
        });
    });
});
