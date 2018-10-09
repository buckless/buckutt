const { pick } = require('lodash');
const { embedParser, embedFilter } = require('@/utils/embedParser');
const rightsDetails = require('@/utils/rightsDetails');

module.exports = async ctx => {
    const now = new Date();

    let giftReloads = [];
    let groups = [];
    let meansOfPayment = [];
    let nfcCosts = [];
    let operators = [];

    // step 1: fetch giftReloads
    giftReloads = await ctx.models.GiftReload.fetchAll().then(gr => gr.toJSON());
    giftReloads = giftReloads.map(gr => pick(gr, ['everyAmount', 'amount']));

    // step 2: fetch groups
    groups = await ctx.models.Group.fetchAll().then(g => g.toJSON());
    groups = groups.map(gr => pick(gr, ['id', 'name']));

    // step 3: fetch meansOfPayment
    meansOfPayment = await ctx.models.MeanOfPayment.fetchAll().then(mop => mop.toJSON());
    meansOfPayment = meansOfPayment.map(mop => pick(mop, ['name', 'slug']));

    // step 4: fetch nfcCosts
    const embedPrices = { embed: 'period', filters: [['end', '>', now]], required: true };

    const prices = await ctx.models.Price.where({ article_id: ctx.event.nfc_id })
        .fetchAll({ withRelated: embedParser([embedPrices]) })
        .then(prices => embedFilter(['period'], prices.toJSON()));

    nfcCosts = prices.map(price => ({
        ...pick(price, ['id', 'amount', 'group_id']),
        ...pick(price.period, ['start', 'end']),
        group: price.group_id
    }));

    if (ctx.user && rightsDetails(ctx.user, ctx.point.id).operator) {
        // step 5: fetch operators
        const embedRights = [
            { embed: 'user', required: true },
            { embed: 'user.meansOfLogin', filters: [['blocked', '=', false]], required: true },
            { embed: 'period', filters: [['end', '>', now]], required: true }
        ];

        const rights = await ctx.models.Right.where({ point_id: ctx.point.id })
            .where('name', '!=', 'admin')
            .fetchAll({ withRelated: embedParser(embedRights) })
            .then(rights => embedFilter(['user.meansOfLogin', 'period'], rights.toJSON()));

        rights.forEach(right => {
            const foundOperatorId = operators.findIndex(o => o.id === right.user.id);
            const formattedRight = {
                name: right.name,
                start: right.period.start,
                end: right.period.end
            };

            if (foundOperatorId === -1) {
                const newOperator = {
                    id: right.user.id,
                    firstname: right.user.firstname,
                    lastname: right.user.lastname,
                    nickname: right.user.nickname,
                    pin: right.user.pin,
                    rights: [formattedRight],
                    meansOfLogin: right.user.meansOfLogin.map(mol => ({
                        type: mol.type,
                        data: mol.data
                    }))
                };

                operators.push(newOperator);
            } else {
                const newOperator = operators[foundOperatorId];
                newOperator.rights.push(formattedRight);
                operators[foundOperatorId] = newOperator;
            }
        });
    }

    return {
        giftReloads,
        groups,
        meansOfPayment,
        nfcCosts,
        operators
    };
};
