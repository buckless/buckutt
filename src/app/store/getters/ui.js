import humanError from '../../utils/humanError';

export const error                = state => humanError(state, state.ui.error);
export const reloadSum            = state => state.reload.reloads.reduce((a, b) => a + b.amount, 0);
export const tabs                 = state => state.ui.tabs.slice().sort((a, b) => a.name.localeCompare(b.name));
export const isDegradedModeActive = state => !state.online.status && state.auth.device.event.config.useCardData;

export const isAssignerMode   = (state, getters) => !getters.loginState && state.auth.seller.canAssign && !getters.isControllerMode;
export const isControllerMode = (state, getters) => !getters.loginState && state.auth.seller.canControl;
export const isSellerMode     = (state, getters) => !getters.loginState && !getters.isAssignerMode && !getters.isControllerMode && state.auth.seller.canSell;
export const isReloaderMode   = (state, getters) => !getters.loginState && !getters.isAssignerMode && !getters.isControllerMode && state.auth.seller.canReload;
export const isCashMode       = (_, getters) => getters.isSellerMode || getters.isReloaderMode;
