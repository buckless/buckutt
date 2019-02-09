export const logged = state => !!state.app.loggedUser;
export const event = state => state.objects.events[0] || {};
