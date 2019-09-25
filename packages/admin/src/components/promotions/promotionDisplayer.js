import sortOrder from '@/lib/sortOrder';

export function promotionDisplayer(promotion) {
    let promotionContent = [];

    if (promotion.sets) {
        promotion.sets.forEach(set => {
            const sortedArticles = (set.articles || []).sort((a, b) => sortOrder(a.name, b.name));

            if (sortedArticles.length > 0) {
                promotionContent.push({
                    type: 'set',
                    set,
                    articles: sortedArticles
                });
            }
        });
    }

    promotionContent = promotionContent.sort((a, b) =>
        sortOrder(a.articles[0].name, b.articles[0].name)
    );

    return promotionContent;
}
