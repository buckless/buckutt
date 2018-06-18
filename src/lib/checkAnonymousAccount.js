const APIError = require('../errors/APIError');

module.exports = (models, meansOfLogin) => {
    const card = meansOfLogin.find(mol => mol.type === 'cardId');

    if (!card) {
        return Promise.resolve();
    }

    return models.MeanOfLogin.where({ type: 'cardId', blocked: false, data: card.data })
        .fetch({
            withRelated: ['user']
        })
        .then(meanOfLogin => {
            if (!meanOfLogin) {
                return Promise.resolve();
            }

            const mol = meanOfLogin.toJSON();
            console.log(mol.user.mail);
            if (mol.user.mail !== 'anon@anon.com') {
                return Promise.reject(
                    new APIError(module, 403, 'Card already binded', {
                        mol
                    })
                );
            }

            return mol.user;
        });
};
