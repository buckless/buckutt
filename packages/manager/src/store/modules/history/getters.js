const translateTable = {
    refund: 'Remboursement',
    promotion: 'Achat',
    purchase: 'Achat',
    reload: 'Rechargement',
    transfer: 'Virement'
};

export const pending = state => state.pending;

export const history = state =>
    state.history.map(transaction => {
        const splittedType = transaction.type.split('-');
        const displayedTransaction = {
            id: transaction.id,
            rawType: splittedType[0],
            date: transaction.date,
            // blank space for the cell to exist and be empty
            point: transaction.point,
            amount: transaction.amount,
            type: splittedType[1]
                ? `Annulation ${translateTable[splittedType[0]]}`
                : translateTable[splittedType[0]],
            operator: `${transaction.seller.firstname} ${transaction.seller.lastname}`
        };

        switch (splittedType[0]) {
            case 'transfer':
                displayedTransaction.object = 'N/A';
                break;
            case 'reload':
                displayedTransaction.object = transaction.mop;
                break;
            case 'refund':
                displayedTransaction.object = transaction.mop;
                break;
            case 'purchase':
                displayedTransaction.object = transaction.articles[0];
                break;
            case 'promotion':
                displayedTransaction.object = transaction.promotion;
                displayedTransaction.articles = transaction.articles;
                break;
            default:
                displayedTransaction.object = 'Autre';
        }

        return displayedTransaction;
    });
