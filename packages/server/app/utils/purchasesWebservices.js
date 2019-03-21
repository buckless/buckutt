const axios = require('axios');
const { models, bookshelf } = require('server/app/db');
const log = require('server/app/log')(module);

module.exports = () => {
    bookshelf.on('saved', models.Purchase, p => {
        models.Purchase.where('id', p.id)
            .fetch({
                withRelated: ['price', 'point', 'wallet', 'wallet.user', 'seller', 'articles', 'promotion']
            })
            .then(purchase_ => {
                if (!purchase_) {
                    return null;
                }

                const purchase = purchase_.toJSON();

                delete purchase.seller.pin;
                delete purchase.seller.password;
                delete purchase.seller.recoverKey;

                if (purchase.wallet.user) {
                    delete purchase.wallet.user.pin;
                    delete purchase.wallet.user.password;
                    delete purchase.wallet.user.recoverKey;
                }

                return models.Webservice.fetchAll().then(webservices =>
                    Promise.all(
                        webservices.toJSON().map(webservice => axios.post(webservice.url, purchase))
                    ).catch(err => {
                        log.error("Couldn't notify webservice", err.message);
                    })
                );
            });
    });
};
