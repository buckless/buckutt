import store from '../store';

const { getters } = store;

export const reloadOnly = () =>
    getters.isReloaderMode && (!getters.isSellerMode && getters.isReloaderMode);

export const reloadNotOnly = () => getters.isReloaderMode && !getters.reloadOnly;

export function routeChooser(_, __, next) {
    if (getters.loginState) {
        return next('/login');
    }

    if (getters.isAssignerMode) {
        return next('/assigner');
    }

    if (getters.isControllerMode) {
        return next('/controller');
    }

    if (reloadOnly()) {
        return next('/reload');
    }

    return next('/items');
}
