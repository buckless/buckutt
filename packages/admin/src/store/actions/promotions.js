/**
 * Promotions actions
 */

export const addStepToPromotion = async ({ dispatch }, data) => {
    const set = await dispatch('createSetWithArticles', {
        articles: data.articles,
        promotion: data.promotion
    });

    return dispatch('addSetToPromotion', {
        set,
        promotion: data.promotion
    });
};

export const addSetToPromotion = ({ dispatch }, data) =>
    dispatch('createRelation', {
        obj1: {
            route: 'sets',
            value: data.set
        },
        obj2: {
            route: 'promotions',
            value: data.promotion
        }
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
