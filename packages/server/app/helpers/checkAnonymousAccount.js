const getAccountFromCard = require('@/helpers/getAccountFromCard');
const APIError = require('@/utils/APIError');

module.exports = async (ctx, meansOfLogin) => {
    const card = meansOfLogin.find(mol => mol.type === 'cardId');

    if (!card) {
        return;
    }

    const user = await getAccountFromCard(ctx.models, card.data);

    if (!user) {
        return;
    }

    if (user.mail !== 'anon@anon.com') {
        throw new APIError(module, 403, 'Card already binded', { card });
    }

    return user;
};
