const STORAGEKEY_USER = 'buckless/manager/user/user';
const STORAGEKEY_TOKEN = 'buckless/manager/user/token';
const STORAGEKEY_LANG = 'buckless/manager/lang/lang';
const STORAGEKEY_ROUTE = 'buckless/manager/route/path';

export const saveUser = ({ user, token }, storage = localStorage) => {
    storage.setItem(STORAGEKEY_USER, JSON.stringify(user));
    storage.setItem(STORAGEKEY_TOKEN, token);
};

export const hasUser = (storage = localStorage) => Boolean(storage.getItem(STORAGEKEY_TOKEN));

export const loadUser = (storage = localStorage) => ({
    user: JSON.parse(storage.getItem(STORAGEKEY_USER)),
    token: storage.getItem(STORAGEKEY_TOKEN)
});

export const removeUser = (storage = localStorage) => {
    storage.removeItem(STORAGEKEY_USER);
    storage.removeItem(STORAGEKEY_TOKEN);
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
