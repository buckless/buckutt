module.exports = async (ctx, cardId) => {
    const meanOfLogin = await ctx.models.MeanOfLogin.where({
        type: 'cardId',
        blocked: false,
        data: cardId
    }).fetch({ withRelated: ['user', 'user.memberships'] });

    if (!meanOfLogin) {
        return;
    }

    return meanOfLogin.toJSON().user;
};
