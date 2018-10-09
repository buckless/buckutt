const generate = (data, fields) => {
    const header = fields.map(f => f.title).join(',');

    const csv = data.map(entry => fields.map(field => field.reducer(entry)).join(',')).join('\n');

    return [header, csv].join('\n');
};

const purchaseFields = [
    { title: 'Date', reducer: p => p.clientTime.toISOString() },
    { title: 'Point de vente', reducer: p => p.point.name },
    { title: 'Vendeur', reducer: p => `${p.seller.firstname} ${p.seller.lastname}` },
    { title: 'Acheteur', reducer: p => `${p.buyer.firstname} ${p.buyer.lastname}` },
    {
        title: 'Article',
        reducer: p => (p.price.article ? p.price.article.name : p.price.promotion.name)
    },
    { title: 'Prix', reducer: p => p.price.amount / 100 }
];

const withdrawalFields = [
    { title: 'Date', reducer: w => w.clientTime.toISOString() },
    { title: 'Point de vente', reducer: w => w.point.name },
    { title: 'Vendeur', reducer: w => `${w.seller.firstname} ${w.seller.lastname}` },
    { title: 'Acheteur', reducer: w => `${w.buyer.firstname} ${w.buyer.lastname}` },
    { title: 'Article', reducer: w => w.name }
];

const reloadFields = [
    { title: 'Date', reducer: r => r.clientTime.toISOString() },
    { title: 'Point de vente', reducer: r => r.point.name },
    { title: 'Vendeur', reducer: r => `${r.seller.firstname} ${r.seller.lastname}` },
    { title: 'Acheteur', reducer: r => `${r.buyer.firstname} ${r.buyer.lastname}` },
    { title: 'Moyen de paiement', reducer: r => r.type },
    { title: 'Montant', reducer: r => r.credit / 100 }
];

const refundFields = [
    { title: 'Date', reducer: r => r.clientTime.toISOString() },
    { title: 'Vendeur', reducer: r => `${r.seller.firstname} ${r.seller.lastname}` },
    { title: 'Acheteur', reducer: r => `${r.buyer.firstname} ${r.buyer.lastname}` },
    { title: 'Moyen de paiement', reducer: r => r.type },
    { title: 'Montant', reducer: r => r.amount / 100 }
];

module.exports = {
    generate,
    purchaseFields,
    withdrawalFields,
    reloadFields,
    refundFields
};
