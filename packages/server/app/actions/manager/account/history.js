const { flatten } = require('lodash');

module.exports = async (ctx, { id, limit, offset }) => {
    const purchaseQuery = ctx.models.Purchase.where({ wallet_id: id }).fetchAll({
        withRelated: ['seller', 'price', 'price.article', 'price.promotion', 'articles', 'point']
    });

    const reloadQuery = ctx.models.Reload.where({ wallet_id: id }).fetchAll({
        withRelated: ['seller', 'point']
    });

    const refundQuery = ctx.models.Refund.where({ wallet_id: id }).fetchAll({
        withRelated: ['seller']
    });

    const transferFromQuery = ctx.models.Transfer.where({ creditor_id: id }).fetchAll({
        withRelated: ['debitor', 'debitor.user']
    });

    const transferToQuery = ctx.models.Transfer.where({ debitor_id: id }).fetchAll({
        withRelated: ['creditor', 'creditor.user']
    });

    const withdrawalsQuery = ctx.models.Withdrawal.where({ wallet_id: id }).fetchAll({
        withRelated: ['seller', 'point']
    });

    const pendingCardUpdatesQuery = ctx.models.PendingCardUpdate.where({
        wallet_id: id
    }).fetchAll();

    let history = [];
    let pending = 0;

    let [
        purchases,
        reloads,
        refunds,
        transfersFrom,
        transfersTo,
        withdrawals,
        pendingCardUpdates
    ] = await Promise.all([
        purchaseQuery,
        reloadQuery,
        refundQuery,
        transferFromQuery,
        transferToQuery,
        withdrawalsQuery,
        pendingCardUpdatesQuery
    ]);

    if (pendingCardUpdates) {
        pending = pendingCardUpdates
            .toJSON()
            .map(p => p.amount)
            .reduce((a, b) => a + b, 0);
    }

    purchases = purchases.toJSON().map(purchase => ({
        id: purchase.id,
        type: purchase.price.promotion
            ? purchase.isCancellation
                ? 'promotion-cancellation'
                : 'promotion'
            : purchase.isCancellation
            ? 'purchase-cancellation'
            : 'purchase',
        date: purchase.clientTime,
        amount: purchase.isCancellation ? purchase.price.amount : -1 * purchase.price.amount,
        point: purchase.point.name,
        seller: {
            lastname: purchase.seller.lastname,
            firstname: purchase.seller.firstname
        },
        articles: flatten(
            purchase.articles.map(article => Array(article._pivot_count).fill(article.name))
        ),
        promotion: purchase.price.promotion ? purchase.price.promotion.name : ''
    }));

    reloads = reloads.toJSON().map(reload => ({
        id: reload.id,
        type: reload.isCancellation ? 'reload-cancellation' : 'reload',
        date: reload.clientTime,
        amount: reload.isCancellation ? -1 * reload.credit : reload.credit,
        point: reload.point.name,
        mop: reload.type,
        seller: {
            lastname: reload.seller.lastname,
            firstname: reload.seller.firstname
        }
    }));

    refunds = refunds.toJSON().map(refund => ({
        id: refund.id,
        type: 'refund',
        date: refund.clientTime,
        amount: -1 * refund.amount,
        point: 'Internet',
        mop: refund.type,
        seller: {
            lastname: refund.seller.lastname,
            firstname: refund.seller.firstname
        }
    }));

    transfersFrom = transfersFrom.toJSON().map(transfer => ({
        id: transfer.id,
        type: 'transfer',
        date: transfer.clientTime,
        amount: transfer.amount,
        point: 'Internet',
        mop: '',
        seller: {
            lastname: transfer.debitor.user.lastname,
            firstname: transfer.debitor.user.firstname
        }
    }));

    transfersTo = transfersTo.toJSON().map(transfer => ({
        id: transfer.id,
        type: 'transfer',
        date: transfer.clientTime,
        amount: -1 * transfer.amount,
        point: 'Internet',
        mop: '',
        seller: {
            lastname: transfer.creditor.user.lastname,
            firstname: transfer.creditor.user.firstname
        }
    }));

    withdrawals = withdrawals.toJSON().map(withdrawal => ({
        id: withdrawal.id,
        type: 'withdrawal',
        date: withdrawal.clientTime,
        amount: 0,
        point: withdrawal.point.name,
        mop: '',
        articles: [withdrawal.name],
        seller: {
            lastname: withdrawal.seller.lastname,
            firstname: withdrawal.seller.firstname
        }
    }));

    history = [...purchases, ...reloads, ...refunds, ...transfersFrom, ...transfersTo, ...withdrawals].sort(
        (a, b) => b.date - a.date
    );

    if (offset) {
        history = history.slice(offset);
    }

    if (limit) {
        history = history.slice(0, limit);
    }

    return { history, pending };
};
