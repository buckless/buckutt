export default (basket, promotions) => {
    const basketPromotions = [];

    let promotionsMatching;

    // loop until no promotion is matching
    do {
        promotionsMatching = 0;

        promotions.forEach(promotion => {
            const container = new Container(basket);

            // Get sets that have one item in basket
            const matchSets = promotion.sets.map(set => container.pickSet(set.articles));

            const promotionPrice = promotion.price.amount;

            // If promotion match
            if (allMatch(matchSets) && container.getContentPrice() > promotionPrice) {
                // remove content from basket
                basket = container.database;

                // push to promotions array
                basketPromotions.push({
                    ...promotion,
                    content: container.content
                });

                promotionsMatching = promotionsMatching + 1;
            }
        });
    } while (promotionsMatching > 0);

    return {
        items: basket,
        promotions: basketPromotions
    };
};

class Container {
    constructor(database) {
        this.database = database.slice().sort((a, b) => b.amount - a.amount);
        this.content = [];
    }

    pickSet(set) {
        const articleMatched = hasSet(this.database, set);

        if (articleMatched) {
            const articleToPush = this.database.find(article => article.id === articleMatched.id);
            this.database = removeFromBasket(this.database, articleMatched);
            this.content.push(articleToPush);

            return true;
        }

        return false;
    }

    getContentPrice() {
        return this.content.map(item => item.amount).reduce((a, b) => a + b, 0);
    }
}

function hasArticle(basket, article) {
    // if basket contains article, returns article
    // else return null
    return basket.find(art => art.id === article.id);
}

function hasSet(basket, set) {
    // if basket has one item from set, returns article
    // else return null
    return set.find(article => !!hasArticle(basket, article));
}

/**
 * const set = [ { id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'c' } ]
 *
 * removeFromBasket(set, { id: 'c' })
 *
 * > [ { id: 'a' }, { id: 'b' }, { id: 'd' }, { id: 'c' } ]
 */
function removeFromBasket(basket, articleToRemove) {
    let removed = false;

    return basket.filter(article => {
        // remove if in articles and if not already removed
        if (article.id === articleToRemove.id && !removed) {
            removed = true;

            return false;
        }

        return true;
    });
}

function allMatch(arr) {
    return arr.reduce((a, b) => a && b, true);
}
