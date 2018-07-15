module.exports = (models, cardId) =>
    models.MeanOfLogin.where({ type: 'cardId', blocked: false, data: cardId })
        .fetch({
            withRelated: ['user', 'user.memberships']
        })
        .then(meanOfLogin => {
            if (!meanOfLogin) {
                return Promise.resolve();
            }

            return meanOfLogin.toJSON().user;
        });
