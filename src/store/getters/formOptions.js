export const articleOptions = state =>
    state.objects.articles.map(article => ({ name: article.name, value: article }));

export const categoryOptions = state =>
    state.objects.categories.map(category => ({ name: category.name, value: category }));

export const deviceOptions = state =>
    state.objects.devices
        .filter(device => device.name !== 'manager' && device.name !== 'admin')
        .map(device => ({ name: device.name, value: device }));

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
    state.objects.periods.map(period => ({ name: period.name, value: period }));

export const currentPeriodOptions = (_, getters) =>
    getters.currentPeriods.map(period => ({ name: period.name, value: period }));
