module.exports = async ctx => {
    let giftReloads = await ctx.models.GiftReload.fetchAll().then(giftReloads =>
        giftReloads ? giftReloads.toJSON() : null
    );

    return giftReloads.map(gr => ({ everyAmount: gr.everyAmount, amount: gr.amount }));
};
