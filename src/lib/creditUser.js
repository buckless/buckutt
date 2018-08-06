const { bookshelf } = require('./bookshelf');
const APIError = require('../errors/APIError');

module.exports = async function(req, userId, amount) {
    const isFromInternet = req.point.name === 'Internet';
    const useCardData = req.event.useCardData;
    const models = req.app.locals.models;

    const user = await models.User.where({ id: userId }).fetch();

    if (!user) {
        return Promise.reject(new APIError(module, 404, 'User not found', { userId }));
    }

    let userCredit = user.get('credit');

    if (isFromInternet && useCardData) {
        await new models.PendingCardUpdate({
            user_id: userId,
            amount
        }).save();
    } else {
        await models.User.query()
            .where({ id: userId })
            .update({
                updated_at: new Date(),
                credit: bookshelf.knex.raw(`credit + ${amount}`)
            });

        userCredit += amount;
    }

    const pending = await models.PendingCardUpdate.query()
        .where({ user_id: userId, active: true })
        .sum('amount as sumAmount');

    const changes = {
        id: userId,
        pending: pending[0].sumAmount,
        credit: userCredit
    };

    req.app.locals.pub.publish('userCreditUpdate', JSON.stringify(changes));

    return changes;
};
