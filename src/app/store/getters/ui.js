import humanError from '../../utils/humanError';

export const error = (state, getters) => humanError(state, getters, state.ui.error);
export const reloadSum = state => state.reload.reloads.reduce((a, b) => a + b.amount, 0);

export const isAssignerMode = (state, getters) =>
    !getters.loginState && state.auth.seller.canAssign && !getters.isControllerMode;
export const isControllerMode = (state, getters) =>
    !getters.loginState && state.auth.seller.canControl;
export const isSellerMode = (state, getters) =>
    !getters.loginState &&
    !getters.isAssignerMode &&
    !getters.isControllerMode &&
    state.auth.seller.canSell;
export const isReloaderMode = (state, getters) =>
    !getters.loginState &&
    !getters.isAssignerMode &&
    !getters.isControllerMode &&
    state.auth.seller.canReload;
export const isCashMode = (_, getters) => getters.isSellerMode || getters.isReloaderMode;
