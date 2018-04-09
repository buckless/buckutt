export const currentPeriods = state =>
    state.objects.periods.filter(period => new Date(period.end) > new Date());
