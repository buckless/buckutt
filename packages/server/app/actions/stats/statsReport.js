const xlsx = require('xlsx');
const { groupBy } = require('lodash');
const dateQuery = require('server/app/utils/statsDateQuery');

const fitToColumn = arrayOfArray =>
    arrayOfArray[0].map((a, i) => ({
        wch: Math.max(...arrayOfArray.map(a2 => a2[i].toString().length))
    }));

module.exports = async (ctx, { type, dateIn, dateOut, point, fundation }) => {
    const workbook = xlsx.utils.book_new();

    workbook.Props = {
        Title: 'Export final événement'
    };

    const priceFormat = '0.00€';

    // Get means of payment
    const resultsMop = await ctx.models.MeanOfPayment.fetchAll();
    const meansOfPayment = resultsMop.toJSON();
    const translateMop = slug => {
        const mop = meansOfPayment.find(mop => mop.slug === slug);

        return mop ? mop.name : slug;
    };

    // Purchases
    const groupField = type === 'points' ? 'point' : 'fundation';
    const showFieldTitle = type === 'points' ? 'Fondation' : 'Guichet';

    let purchaseQuery = dateQuery(ctx.models.Purchase, dateIn, dateOut);

    if (point) {
        purchaseQuery = purchaseQuery.where({ 'purchases.point_id': point });
    }

    const price = fundation
        ? { price: q => q.where({ 'prices.fundation_id': fundation }) }
        : { price: q => q };

    const resultsPurchases = await purchaseQuery.query(knex => {
        knex.select(
            'articles.name as article_name',
            'promotions.name as promotion_name',
            'purchases.amount as amount',
            'purchases.isCancellation as isCancellation',
            'points.name as point_name',
            'fundations.name as fundation_name'
        );
        knex.count('purchases.amount as count');
        knex.sum('purchases.amount as total');
        knex.leftJoin('prices', 'prices.id', 'purchases.price_id');
        knex.leftJoin('articles', 'articles.id', 'prices.article_id');
        knex.leftJoin('promotions', 'promotions.id', 'prices.promotion_id');
        knex.leftJoin('points', 'points.id', 'prices.point_id');
        knex.leftJoin('fundations', 'fundations.id', 'prices.fundation_id');
        price.price(knex);
        knex.groupBy(
            'purchases.isCancellation',
            'purchases.amount',
            'articles.name',
            'promotions.name',
            'points.name',
            'fundations.name'
        );
    }).fetchAll();

    const mappedPurchases = resultsPurchases
        .toJSON()
        .map(p => ({
            price: p.amount / 100,
            total: p.total / 100,
            count: parseInt(p.count, 10),
            name: p.article_name || p.promotion_name,
            point: p.point_name,
            fundation: p.fundation_name,
            isCancellation: p.isCancellation
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    const groupedPurchases = groupBy(mappedPurchases, groupField);

    Object.entries(groupedPurchases).forEach(([sheet, values]) => {
        workbook.SheetNames.push(`Achats ${sheet}`);

        const worksheet_data = values.map(value => [
            value.count,
            value.isCancellation ? `Annulation ${value.name}` : value.name,
            type === 'points' ? value.fundation : value.point,
            value.price,
            value.isCancellation ? -1 * value.total : value.total
        ]);

        const arrayOfArray = [
            ['Quantité', 'Article', showFieldTitle, 'Prix unitaire', 'Prix total']
        ].concat(worksheet_data, [['', '', '', '', ''], ['', '', '', 'Total', '']]);
        const worksheet = xlsx.utils.aoa_to_sheet(arrayOfArray);

        for (let i = 1; i <= values.length; i++) {
            const colD = xlsx.utils.encode_cell({ r: i, c: 3 });
            const colE = xlsx.utils.encode_cell({ r: i, c: 4 });
            worksheet[colD].z = priceFormat;
            worksheet[colE].z = priceFormat;
        }

        const total = worksheet_data.map(value => value[4]).reduce((a, b) => a + b, 0);
        const colTotal = xlsx.utils.encode_cell({ r: values.length + 2, c: 4 });
        worksheet[colTotal] = { t: 'n', z: priceFormat, v: total };

        worksheet['!cols'] = fitToColumn(arrayOfArray);

        workbook.Sheets[`Achats ${sheet}`] = worksheet;
    });

    // Withdrawals
    let withDrawalsQuery = dateQuery(ctx.models.Withdrawal, dateIn, dateOut);

    if (point) {
        withDrawalsQuery = withDrawalsQuery.where({ point_id: point });
    }

    const resultsWithdrawals = await withDrawalsQuery.query(knex => {
        knex.select(
            'articles.name as article_name',
            'coupons.name as coupon_name',
            'withdrawals.isCancellation as isCancellation',
            'points.name as point_name'
        );
        knex.count('withdrawals.* as count');
        knex.leftJoin('articles', 'articles.id', 'withdrawals.article_id');
        knex.leftJoin('points', 'points.id', 'withdrawals.point_id');
        knex.leftJoin('coupons', 'coupons.id', 'withdrawals.coupon_id');
        knex.groupBy('withdrawals.isCancellation', 'coupons.name', 'articles.name', 'points.name');
    }).fetchAll();

    const mappedWithdrawals = resultsWithdrawals
        .toJSON()
        .map(w => ({
            count: parseInt(w.count, 10),
            name: w.article_name,
            coupon: w.coupon_name,
            point: w.point_name,
            isCancellation: w.isCancellation
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    const groupedWithdrawals = groupBy(mappedWithdrawals, 'point');

    Object.entries(groupedWithdrawals).forEach(([sheet, values]) => {
        workbook.SheetNames.push(`Coupons ${sheet}`);

        const worksheet_data = values.map(value => [
            value.count,
            value.isCancellation ? `Annulation ${value.name}` : value.name,
            value.coupon
        ]);

        const arrayOfArray = [['Quantité', 'Article', 'Coupon utilisé']].concat(worksheet_data);
        const worksheet = xlsx.utils.aoa_to_sheet(arrayOfArray);

        worksheet['!cols'] = fitToColumn(arrayOfArray);

        workbook.Sheets[`Coupons ${sheet}`] = worksheet;
    });

    // Reloads
    let reloadQuery = dateQuery(ctx.models.Reload, dateIn, dateOut);

    if (point) {
        reloadQuery = reloadQuery.where({ point_id: point });
    }

    const resultsReloads = await reloadQuery.query(knex => {
        knex.select('reloads.type', 'reloads.isCancellation', 'points.name as point_name');
        knex.count('reloads.id as count');
        knex.sum('reloads.credit as total');
        knex.leftJoin('points', 'points.id', 'reloads.point_id');
        knex.groupBy('reloads.isCancellation', 'reloads.type', 'points.name');
    }).fetchAll();

    const mappedReloads = resultsReloads
        .toJSON()
        .map(r => ({
            total: r.total / 100,
            count: parseInt(r.count, 10),
            type: translateMop(r.type),
            point: r.point_name,
            isCancellation: r.isCancellation
        }))
        .sort((a, b) => a.type.localeCompare(b.type));

    const groupedReloads = groupBy(mappedReloads, 'point');

    Object.entries(groupedReloads).forEach(([sheet, values]) => {
        workbook.SheetNames.push(`Crédits ${sheet}`);

        const worksheet_data = values.map(value => [
            value.count,
            value.isCancellation ? `Annulation ${value.type}` : value.type,
            value.isCancellation ? -1 * value.total : value.total
        ]);

        const arrayOfArray = [['Quantité', 'Moyen de paiement', 'Montant total']].concat(
            worksheet_data,
            [['', '', ''], ['', 'Total', '']]
        );
        const worksheet = xlsx.utils.aoa_to_sheet(arrayOfArray);

        for (let i = 1; i <= values.length; i++) {
            const colC = xlsx.utils.encode_cell({ r: i, c: 2 });
            worksheet[colC].z = priceFormat;
        }

        const total = worksheet_data.map(value => value[2]).reduce((a, b) => a + b, 0);
        const colTotal = xlsx.utils.encode_cell({ r: values.length + 2, c: 2 });
        worksheet[colTotal] = { t: 'n', z: priceFormat, v: total };

        worksheet['!cols'] = fitToColumn(arrayOfArray);

        workbook.Sheets[`Crédits ${sheet}`] = worksheet;
    });

    // Refunds
    let refundQuery = dateQuery(ctx.models.Refund, dateIn, dateOut);

    if (point) {
        refundQuery = refundQuery.where({ point_id: point });
    }

    const resultsRefunds = await refundQuery.query(knex => {
        knex.select('refunds.type', 'refunds.isCancellation', 'points.name as point_name');
        knex.count('refunds.id as count');
        knex.sum('refunds.amount as total');
        knex.leftJoin('points', 'points.id', 'refunds.point_id');
        knex.groupBy('refunds.isCancellation', 'refunds.type', 'points.name');
    }).fetchAll();

    const mappedRefunds = resultsRefunds
        .toJSON()
        .map(r => ({
            total: r.total / 100,
            count: parseInt(r.count, 10),
            type: translateMop(r.type),
            point: r.point_name,
            isCancellation: r.isCancellation
        }))
        .sort((a, b) => a.type.localeCompare(b.type));

    const groupedRefunds = groupBy(mappedRefunds, 'point');

    Object.entries(groupedRefunds).forEach(([sheet, values]) => {
        workbook.SheetNames.push(`Remboursements ${sheet}`);

        const worksheet_data = values.map(value => [
            value.count,
            value.isCancellation ? `Annulation ${value.type}` : value.type,
            value.isCancellation ? -1 * value.total : value.total
        ]);

        const arrayOfArray = [['Quantité', 'Moyen de paiement', 'Montant total']].concat(
            worksheet_data,
            [['', '', ''], ['', 'Total', '']]
        );
        const worksheet = xlsx.utils.aoa_to_sheet(arrayOfArray);

        for (let i = 1; i <= values.length; i++) {
            const colC = xlsx.utils.encode_cell({ r: i, c: 2 });
            worksheet[colC].z = priceFormat;
        }

        const total = worksheet_data.map(value => value[2]).reduce((a, b) => a + b, 0);
        const colTotal = xlsx.utils.encode_cell({ r: values.length + 2, c: 2 });
        worksheet[colTotal] = { t: 'n', z: priceFormat, v: total };

        worksheet['!cols'] = fitToColumn(arrayOfArray);

        workbook.Sheets[`Remboursements ${sheet}`] = worksheet;
    });

    return new Buffer(xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' }));
};
