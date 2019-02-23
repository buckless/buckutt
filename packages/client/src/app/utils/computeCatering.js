export default (items, configCaterig, buyerCatering) => {
    const catering = [];
    const now = new Date();

    const validCatering = configCaterig.articles.filter(article => {
        if (!article.start && !article.end) {
            return true;
        } else if (article.start && !article.end) {
            return article.start <= now;
        } else if (!article.start && article.end) {
            return article.end >= now;
        }
        return article.start <= now && article.end >= now;
    });

    const remainingBuyerCatering = buyerCatering
        .slice()
        .filter(cat => cat.balance > 0 && validCatering.find(valid => valid.id === cat.id))
        .map(cat => {
            const configCat = validCatering.find(valid => valid.id === cat.id);
            return {
                ...cat,
                articles: configCat.articles,
                name: configCat.name
            };
        });

    const orderedItems = items.slice().sort((a, b) => b.price.amount - a.price.amount);
    const newItems = [];

    orderedItems.forEach(entry => {
        const matchingCatering = remainingBuyerCatering.find(
            cat => cat.balance > 0 && (cat.articles || []).indexOf(entry.id) > -1
        );

        if (matchingCatering) {
            matchingCatering.balance -= 1;
            catering.push({
                ...entry,
                cateringId: matchingCatering.id
            });
        } else {
            newItems.push(entry);
        }
    });

    return {
        itemList: newItems,
        catering
    };
};
