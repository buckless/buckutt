const formOptions = object =>
    object.allIds
        .map(entry => object.values[entry])
        .map(entry => ({
            id: entry.id,
            label: entry.name
        }));

const formOptions_ = objects =>
    objects.map(entry => ({
        id: entry.id,
        label: entry.name
    }));

export const meansOfPaymentOptions = state =>
    state.api.meansofpayment.allIds
        .map(entry => state.api.meansofpayment.values[entry])
        .map(entry => ({
            id: entry.slug,
            label: entry.name
        }));

export const articlesOptions = state => formOptions(state.api.articles);
export const promotionsOptions = state => formOptions(state.api.promotions);
export const pointsOptions = state => formOptions(state.api.points);
export const fundationsOptions = state => formOptions(state.api.fundations);
export const categoriesOptions = state => formOptions(state.api.categories);
export const groupsOptions = state => formOptions(state.api.groups);
export const oldPeriodsOptions = (_, getters) => formOptions_(getters.oldPeriods);
export const currentPeriodsOptions = (_, getters) => formOptions_(getters.currentPeriods);
