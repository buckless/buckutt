import { store } from '../store';
import { getUser } from '../store/user/selectors';
import { getRegisterState } from '../store/register/selectors';

export const isUserLoggedIn = () => Boolean(getUser(store.state.user));

export const isUserAllowedToSeeRegisterStep = step =>
    // allow user to go back from ticket to card
    (getRegisterState(store.state.register) === 'ticket' && step === 'card') ||
    // allow user to see his current step
    getRegisterState(store.state.register) === step;
