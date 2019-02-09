module.exports = async ctx => {
    const groups = await ctx.models.Group.where('id', '!=', ctx.event.defaultGroup_id)
        .fetchAll()
        .then(groups_ => groups_.toJSON());

    return groups.map(group => ({
        id: group.id,
        name: group.name
    }));
};
