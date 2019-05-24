const generate = (data, fields) => {
    const header = fields.map(f => f.title).join(',');

    const csv = data.map(entry => fields.map(field => field.reducer(entry)).join(',')).join('\n');

    return [header, csv].join('\n');
};

const multiplier = isCancellation => (isCancellation ? -1 : 1);

const purchaseFields = [
    { title: 'Date', reducer: p => p.clientTime.toISOString() },
    { title: 'Point de vente', reducer: p => p.point.name },
    { title: 'Vendeur', reducer: p => `${p.seller.firstname} ${p.seller.lastname}` },
    {
        title: 'Support',
        reducer: p =>
            p.wallet.physical_id
                ? `${p.wallet.logical_id} (${p.wallet.physical_id})`
                : p.wallet.logical_id
    },
    {
        title: 'Acheteur',
        reducer: p =>
            p.wallet.user ? `${p.wallet.user.firstname} ${p.wallet.user.lastname}` : 'Anonyme'
    },
    {
        title: 'Article',
        reducer: p => (p.price.article ? p.price.article.name : p.price.promotion.name)
    },
    { title: 'Prix', reducer: p => (multiplier(p.isCancellation) * p.price.amount) / 100 },
    { title: 'Type', reducer: p => (p.isCancellation ? 'Annulation' : 'Achat') }
];

const withdrawalFields = [
    { title: 'Date', reducer: w => w.clientTime.toISOString() },
    { title: 'Point de vente', reducer: w => w.point.name },
    { title: 'Vendeur', reducer: w => `${w.seller.firstname} ${w.seller.lastname}` },
    {
        title: 'Support',
        reducer: w =>
            w.wallet.physical_id
                ? `${w.wallet.logical_id} (${w.wallet.physical_id})`
                : w.wallet.logical_id
    },
    {
        title: 'Acheteur',
        reducer: w =>
            w.wallet.user ? `${w.wallet.user.firstname} ${w.wallet.user.lastname}` : 'Anonyme'
    },
    { title: 'Article', reducer: w => w.name }
];

const reloadFields = [
    { title: 'Date', reducer: r => r.clientTime.toISOString() },
    { title: 'Point de vente', reducer: r => r.point.name },
    { title: 'Vendeur', reducer: r => `${r.seller.firstname} ${r.seller.lastname}` },
    {
        title: 'Support',
        reducer: r =>
            r.wallet.physical_id
                ? `${r.wallet.logical_id} (${r.wallet.physical_id})`
                : r.wallet.logical_id
    },
    {
        title: 'Acheteur',
        reducer: r =>
            r.wallet.user ? `${r.wallet.user.firstname} ${r.wallet.user.lastname}` : 'Anonyme'
    },
    { title: 'Moyen de paiement', reducer: r => r.type },
    { title: 'Montant', reducer: r => (multiplier(r.isCancellation) * r.credit) / 100 },
    { title: 'Type', reducer: r => (r.isCancellation ? 'Annulation' : 'Rechargement') }
];

const refundFields = [
    { title: 'Date', reducer: r => r.clientTime.toISOString() },
    { title: 'Vendeur', reducer: r => `${r.seller.firstname} ${r.seller.lastname}` },
    {
        title: 'Support',
        reducer: r =>
            r.wallet.physical_id
                ? `${r.wallet.logical_id} (${r.wallet.physical_id})`
                : r.wallet.logical_id
    },
    {
        title: 'Acheteur',
        reducer: r =>
            r.wallet.user ? `${r.wallet.user.firstname} ${r.wallet.user.lastname}` : 'Anonyme'
    },
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
