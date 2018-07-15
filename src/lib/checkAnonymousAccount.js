const APIError = require('../errors/APIError');
const getAccountFromCard = require('./getAccountFromCard');

module.exports = (models, meansOfLogin) => {
    const card = meansOfLogin.find(mol => mol.type === 'cardId');

    if (!card) {
        return Promise.resolve();
    }

    return getAccountFromCard(models, card.data).then(user => {
        if (!user) {
            return Promise.resolve();
        }

        if (user.mail !== 'anon@anon.com') {
            return Promise.reject(
                new APIError(module, 403, 'Card already binded', {
                    mol
                })
            );
        }

        return user;
    });
};
