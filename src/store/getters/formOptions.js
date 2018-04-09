export const articleOptions = state =>
    state.objects.articles.map(article => ({ name: article.name, value: article }));

export const categoryOptions = state =>
    state.objects.categories.map(category => ({ name: category.name, value: category }));

export const deviceOptions = state =>
    state.objects.devices.map(device => ({ name: device.name, value: device }));

export const groupOptions = state =>
    state.objects.groups.map(group => ({ name: group.name, value: group }));

export const pointOptions = state =>
    state.objects.points.map(point => ({ name: point.name, value: point }));

export const promotionOptions = state =>
    state.objects.promotions.map(promotion => ({ name: promotion.name, value: promotion }));

export const fundationOptions = state =>
    state.objects.fundations.map(fundation => ({ name: fundation.name, value: fundation }));

export const eventOptions = state =>
    state.objects.events.map(event => ({ name: event.name, value: event }));

export const periodOptions = state =>
    !state.app.currentEvent
        ? []
        : state.objects.periods
              .filter(period => period.event_id === state.app.currentEvent.id)
              .map(period => ({ name: period.name, value: period }));

export const currentPeriodOptions = (state, getters) =>
    !state.app.currentEvent
        ? []
        : getters.currentPeriods
              .filter(period => period.event_id === state.app.currentEvent.id)
              .map(period => ({ name: period.name, value: period }));
