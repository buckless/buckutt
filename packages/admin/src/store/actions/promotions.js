/**
 * Promotions actions
 */

export const addStepToPromotion = ({ dispatch }, data) =>
    dispatch('createSetWithArticles', {
        set: {},
        articles: data.articles,
        promotion: data.promotion
    });

export const removeSetFromPromotion = async ({ dispatch }, data) => {
    await dispatch('removeRelation', {
        obj1: {
            route: 'promotions',
            value: data.promotion
        },
        obj2: {
            route: 'sets',
            value: data.set
        }
    });

    return dispatch('removeObject', { route: 'sets', value: data.set });
};

export const addArticleToStep = ({ dispatch }, data) => {
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
};

export const removeArticleFromStep = async ({ dispatch }, data) => {
    const article = data.article;
    const promotion = data.promotion;
    const step = data.step;

    if (step.set.articles.length > 1) {
        return dispatch('removeArticleFromSet', {
            article,
            promotion,
            set: step.set
        });
    }

    await dispatch('removeArticleFromSet', {
        article,
        promotion,
        set: step.set
    });

    return dispatch('removeSetFromPromotion', { promotion, set: step.set });
};

/**
 * Sets actions
 */

export const createSetWithArticles = async ({ dispatch }, payload) => {
    const set = payload.set;
    const articles = payload.articles;
    const promotion = payload.promotion;

    const result = await dispatch('createObject', { route: 'sets', value: set });

    await dispatch('createRelation', {
        obj1: {
            route: 'sets',
            value: result
        },
        obj2: {
            route: 'promotions',
            value: promotion
        }
    });

    return Promise.all(
        articles.map(article => dispatch('addArticleToSet', { set: result, article }))
    );
};

export const addArticleToSet = ({ dispatch }, payload) =>
    dispatch('createRelation', {
        obj1: {
            route: 'sets',
            value: payload.set
        },
        obj2: {
            route: 'articles',
            value: payload.article
        }
    });

export const removeArticleFromSet = ({ dispatch }, payload) =>
    dispatch('removeRelation', {
        obj1: {
            route: 'sets',
            value: payload.set
        },
        obj2: {
            route: 'articles',
            value: payload.article
        }
    });
