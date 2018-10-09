module.exports = async (ctx, { id }) => {
    const user = await ctx.models.User.where({ id }).fetch({ require: true });

    return user.toJSON();
};
