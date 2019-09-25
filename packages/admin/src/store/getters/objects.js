export const currentPeriods = state =>
    state.api.periods.allIds
        .map(entry => state.api.periods.values[entry])
        .filter(period => new Date(period.end) >= new Date());

export const oldPeriods = state =>
    state.api.periods.allIds
        .map(entry => state.api.periods.values[entry])
        .filter(period => new Date(period.end) < new Date());
