export const logged = state => !!state.app.loggedUser;

export const protectedPeriodsIds = state =>
    state.objects.events.map(event => event.defaultPeriod_id);

export const protectedGroupsIds = state => state.objects.events.map(event => event.defaultGroup_id);

export const protectedFundationsIds = state =>
    state.objects.events.map(event => event.defaultFundation_id);
