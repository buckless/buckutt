export const reshapeHistoryEntry = data => ({
    amount: data.amount,
    date: new Date(data.date),
    id: data.id,
    meanOfPayment: data.mop,
    point: data.point,
    seller: `${data.seller.firstname} ${data.seller.lastname}`,
    articles: data.articles,
    promotion: data.promotion,
    type: data.type
});

export const reshapeHistory = data => ({
    history: data.history.map(reshapeHistoryEntry),
    walletCredit: data.wallet.credit,
    pending: data.pending
});
