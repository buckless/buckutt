import {
    saveUser,
    hasUser,
    loadUser,
    removeUser,
    restoreRoute,
    saveRouteBeforeAuth,
    saveLang,
    loadLang
} from '../index';

const user = { foo: 'bar' };
const token = 'baz';
const wallet = 'foz';
const path = '/dashboard/ticket';
const lang = 'en';

const createStorage = () => {
    const storage = {};

    Object.defineProperties(storage, {
        setItem: {
            value: (key, value) => {
                storage[key] = value;
            }
        },

        getItem: {
            enumerable: false,
            value: key => storage[key]
        },

        removeItem: {
            enumerable: false,
            value: key => {
                delete storage[key];
            }
        }
    });

    return storage;
};

describe('saveUser()', () => {
    describe('given a user and a token', () => {
        const storage = createStorage();

        saveUser(
            {
                user,
                token,
                wallet
            },
            storage
        );

        it('saves the user and token in the storage', () => {
            expect(storage['buckless/manager/user/user']).toBe(JSON.stringify(user));
            expect(storage['buckless/manager/user/token']).toBe(token);
            expect(storage['buckless/manager/user/wallet']).toBe(wallet);
        });
    });
});

describe('hasUser()', () => {
    describe('given a user and an empty storage', () => {
        const storage = createStorage();
        const res = hasUser(storage);

        it('returns false', () => {
            expect(res).toBe(false);
        });
    });

    describe('given a user and a storage containing a user', () => {
        const storage = createStorage();

        saveUser(
            {
                user,
                token,
                wallet
            },
            storage
        );

        const res = hasUser(storage);

        it('returns true', () => {
            expect(res).toBe(true);
        });
    });
});

describe('loadUser()', () => {
    describe('given a user and an empty storage', () => {
        const storage = createStorage();
        const loadSavedUser = () => loadUser(storage);

        it('throws', () => {
            expect(loadSavedUser).toThrow();
        });
    });

    describe('given a user and a storage containing a user', () => {
        const storage = createStorage();

        saveUser(
            {
                user,
                token,
                wallet
            },
            storage
        );

        const res = loadUser(storage);

        it('returns the user and the token', () => {
            expect(res).toEqual({
                user,
                token,
                wallet
            });
        });
    });
});

describe('removeUser()', () => {
    describe('given a user and a storage containing a user', () => {
        const storage = createStorage();

        saveUser(
            {
                user,
                token,
                wallet
            },
            storage
        );

        removeUser(storage);

        it('saves the user and token in the storage', () => {
            expect(Object.keys(storage).length).toBe(0);
        });
    });
});

describe('saveRouteBeforeAuth()', () => {
    describe('given a route and an empty storage', () => {
        const storage = createStorage();
        saveRouteBeforeAuth(path, storage);

        it('saves the route in the storage', () => {
            expect(Object.values(storage)).toEqual([path]);
        });
    });
});

describe('restoreRoute()', () => {
    describe('given a storage containing a route', () => {
        const storage = createStorage();
        saveRouteBeforeAuth(path, storage);

        const result = restoreRoute(storage);

        it('saves the user and token in the storage', () => {
            expect(result).toBe(path);
            expect(Object.keys(storage).length).toBe(0);
        });
    });
});

describe('saveLang()', () => {
    describe('given a chosen language', () => {
        const storage = createStorage();

        saveLang(lang, storage);

        it('saves the language in the storage', () => {
            expect(storage['buckless/manager/lang/lang']).toBe(lang);
        });
    });
});

describe('loadLang()', () => {
    describe('given a language and an empty storage', () => {
        const storage = createStorage();
        const res = loadLang(storage);

        it('returns the navigator language', () => {
            expect(res).toEqual(navigator.language.split('-')[0]);
        });
    });

    describe('given a language and a storage containing a language', () => {
        const storage = createStorage();

        saveLang(lang, storage);

        const res = loadLang(storage);

        it('returns the language', () => {
            expect(res).toEqual(lang);
        });
    });
});
