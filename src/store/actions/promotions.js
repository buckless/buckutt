import { post } from '../../lib/fetch';

/**
 * Promotions actions
 */

export function addStepToPromotion({ dispatch }, data) {
    return dispatch('createSetWithArticles', {
        set: {},
        articles: data.articles,
        promotion: data.promotion
    });
}

export function removeSetFromPromotion({ dispatch }, data) {
    return dispatch('removeRelation', {
        obj1: {
            route: 'promotions',
            value: data.promotion
        },
        obj2: {
            route: 'sets',
            value: data.set
        }
    }).then(() => dispatch('removeObject', { route: 'sets', value: data.set }));
}

export function addArticleToStep({ dispatch }, data) {
    const article = data.article;
    const step = data.step;

    const articlesIds = step.set.articles.map(a => a.id);

    if (articlesIds.indexOf(article.id) !== -1) {
        return Promise.reject(new Error('The article is already in this set'));
    }

    return dispatch('addArticleToSet', {
        article,
        set: step.set,
        promotion: data.promotion
    });
}

export function removeArticleFromStep({ dispatch }, data) {
    const article = data.article;
    const promotion = data.promotion;
    const step = data.step;

    if (step.set.articles.length > 1) {
        return dispatch('removeArticleFromSet', { article, promotion, set: step.set });
    }

    return dispatch('removeArticleFromSet', { article, promotion, set: step.set }).then(() =>
        dispatch('removeSetFromPromotion', { promotion, set: step.set })
    );
}

/**
 * Sets actions
 * TODO: Don't use deepest focused element but determine which one is the promotion
 */

export function createSetWithArticles({ commit, dispatch }, payload) {
    const set = payload.set;
    const articles = payload.articles;
    const promotion = payload.promotion;

    return post('sets', set).then(result => {
        dispatch('checkAndAddObjects', { route: 'sets', objects: [result] });

        post(`sets/${result.id}/promotions/${promotion.id}`).catch(err => {
            commit('UPDATEAPIERROR', err);
        });

        articles.forEach(article => {
            post(`sets/${result.id}/articles/${article.id}`);
        });

        return dispatch('updateDeepestFocusedElement', {
            newRelation: 'sets',
            value: {
                id: result.id,
                articles
            }
        });
    });
}

export function addArticleToSet({ dispatch }, payload) {
    const index = payload.promotion.sets.findIndex(s => s.id === payload.set.id);

    dispatch('updateDeepestFocusedElement', {
        newRelation: `sets[${index}].articles`,
        value: payload.article
    });

    return dispatch('createRelation', {
        obj1: {
            route: 'sets',
            value: payload.set
        },
        obj2: {
            route: 'articles',
            value: payload.article
        }
    });
}

export function removeArticleFromSet({ dispatch }, payload) {
    const index = payload.promotion.sets.findIndex(s => s.id === payload.set.id);

    dispatch('updateDeepestFocusedElement', {
        delRelation: `sets[${index}].articles`,
        value: payload.article
    });

    return dispatch('removeRelation', {
        obj1: {
            route: 'sets',
            value: payload.set
        },
        obj2: {
            route: 'articles',
            value: payload.article
        }
    });
}
