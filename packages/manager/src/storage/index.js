const STORAGEKEY_USER = 'buckless/manager/user/user';
const STORAGEKEY_TOKEN = 'buckless/manager/user/token';
const STORAGEKEY_WALLET = 'buckless/manager/user/wallet';
const STORAGEKEY_LANG = 'buckless/manager/lang/lang';
const STORAGEKEY_ROUTE = 'buckless/manager/route/path';

export const saveUser = ({ user, token, wallet }, storage = localStorage) => {
    if (user) {
        storage.setItem(STORAGEKEY_USER, JSON.stringify(user));
    }

    if (token) {
        storage.setItem(STORAGEKEY_TOKEN, token);
    }

    if (wallet) {
        storage.setItem(STORAGEKEY_WALLET, wallet);
    }
};

export const hasUser = (storage = localStorage) => Boolean(storage.getItem(STORAGEKEY_TOKEN));

export const loadUser = (storage = localStorage) => ({
    user: JSON.parse(storage.getItem(STORAGEKEY_USER)),
    token: storage.getItem(STORAGEKEY_TOKEN),
    wallet: storage.getItem(STORAGEKEY_WALLET)
});

export const removeUser = (storage = localStorage) => {
    storage.removeItem(STORAGEKEY_USER);
    storage.removeItem(STORAGEKEY_TOKEN);
    storage.removeItem(STORAGEKEY_WALLET);
};

export const saveRouteBeforeAuth = (path, storage = sessionStorage) => {
    storage.setItem(STORAGEKEY_ROUTE, path);
};

export const restoreRoute = (storage = sessionStorage) => {
    const route = storage.getItem(STORAGEKEY_ROUTE);
    storage.removeItem(STORAGEKEY_ROUTE);
    return route;
};

export const saveLang = (lang, storage = localStorage) => {
    storage.setItem(STORAGEKEY_LANG, lang);
};

export const loadLang = (storage = localStorage) =>
    storage.getItem(STORAGEKEY_LANG) || (navigator ? navigator.language.split('-')[0] : 'en');
