/**
 * Sets actions
 */

export const createSetWithArticles = async ({ dispatch }, payload) => {
    const articles = payload.articles;
    const result = await dispatch('createObject', { route: 'sets', value: {} });

    await Promise.all(
        articles.map(article => dispatch('addArticleToSet', { set: result, article }))
    );

    return result;
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
