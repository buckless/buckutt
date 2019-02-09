const { bookshelf } = require('@/db');
const APIError = require('@/utils/APIError');

module.exports = async (ctx, userId, amount) => {
    const isFromInternet = ctx.point.name === 'Internet';
    const useCardData = ctx.event.useCardData;

    const user = await ctx.models.User.where({ id: userId }).fetch();

    if (!user) {
        throw new APIError(module, 404, 'User not found', { userId });
    }

    let userCredit = user.get('credit');

    if (isFromInternet && useCardData) {
        await new ctx.models.PendingCardUpdate({
            user_id: userId,
            amount
        }).save();
    } else {
        await ctx.models.User.query()
            .where({ id: userId })
            .update({
                updated_at: new Date(),
                credit: bookshelf.knex.raw(`credit + ${amount}`)
            });

        userCredit += amount;
    }

    const pending = await ctx.models.PendingCardUpdate.query()
        .where({ user_id: userId, active: true })
        .sum('amount as sumAmount');

    const changes = {
        id: userId,
        pending: pending[0].sumAmount,
        credit: userCredit
    };

    ctx.pub.publish('userCreditUpdate', JSON.stringify(changes));

    return changes;
};
