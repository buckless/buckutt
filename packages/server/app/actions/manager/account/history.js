const { flatten } = require('lodash');

module.exports = async (ctx, { id, limit, offset }) => {
    const purchaseQuery = ctx.models.Purchase.where({ buyer_id: id }).fetchAll({
        withRelated: ['seller', 'price', 'price.article', 'price.promotion', 'articles', 'point'],
        withDeleted: true
    });

    const reloadQuery = ctx.models.Reload.where({ buyer_id: id }).fetchAll({
        withRelated: ['seller', 'point'],
        withDeleted: true
    });

    const refundQuery = ctx.models.Refund.where({ buyer_id: id }).fetchAll({
        withRelated: ['seller'],
        withDeleted: true
    });

    const transferFromQuery = ctx.models.Transfer.where({ reciever_id: id }).fetchAll({
        withRelated: ['sender'],
        withDeleted: true
    });

    const transferToQuery = ctx.models.Transfer.where({ sender_id: id }).fetchAll({
        withRelated: ['reciever'],
        withDeleted: true
    });

    const pendingCardUpdatesQuery = ctx.models.PendingCardUpdate.where({ user_id: id }).fetchAll();

    let history = [];
    let pending = 0;

    let [
        purchases,
        reloads,
        refunds,
        transfersFrom,
        transfersTo,
        pendingCardUpdates
    ] = await Promise.all([
        purchaseQuery,
        reloadQuery,
        refundQuery,
        transferFromQuery,
        transferToQuery,
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
        type: purchase.price.promotion ? 'promotion' : 'purchase',
        date: purchase.clientTime,
        amount: -1 * purchase.price.amount,
        point: purchase.point.name,
        seller: {
            lastname: purchase.seller.lastname,
            firstname: purchase.seller.firstname
        },
        articles: flatten(
            purchase.articles.map(article => Array(article._pivot_count).fill(article.name))
        ),
        promotion: purchase.price.promotion ? purchase.price.promotion.name : '',
        isCanceled: !!purchase.deleted_at
    }));

    reloads = reloads.toJSON().map(reload => ({
        id: reload.id,
        type: 'reload',
        date: reload.clientTime,
        amount: reload.credit,
        point: reload.point.name,
        mop: reload.type,
        seller: {
            lastname: reload.seller.lastname,
            firstname: reload.seller.firstname
        },
        isCanceled: !!reload.deleted_at
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
        },
        isCanceled: !!refund.deleted_at
    }));

    transfersFrom = transfersFrom.toJSON().map(transfer => ({
        id: transfer.id,
        type: 'transfer',
        date: transfer.clientTime,
        amount: transfer.amount,
        point: 'Internet',
        mop: '',
        seller: {
            lastname: transfer.sender.lastname,
            firstname: transfer.sender.firstname
        },
        isCanceled: !!transfer.deleted_at
    }));

    transfersTo = transfersTo.toJSON().map(transfer => ({
        id: transfer.id,
        type: 'transfer',
        date: transfer.clientTime,
        amount: -1 * transfer.amount,
        point: 'Internet',
        mop: '',
        seller: {
            lastname: transfer.reciever.lastname,
            firstname: transfer.reciever.firstname
        },
        isCanceled: !!transfer.deleted_at
    }));

    history = [...purchases, ...reloads, ...refunds, ...transfersFrom, ...transfersTo].sort(
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
