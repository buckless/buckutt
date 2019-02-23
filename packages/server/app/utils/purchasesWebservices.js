const axios = require('axios');
const { models, bookshelf } = require('server/app/db');
const log = require('server/app/log')(module);

module.exports = () => {
    bookshelf.on('saved', models.Purchase, p => {
        models.Purchase.where('id', p.id)
            .fetch({
                withRelated: ['price', 'point', 'buyer', 'seller', 'articles', 'promotion']
            })
            .then(purchase_ => {
                if (!purchase_) {
                    return null;
                }

                const purchase = purchase_.toJSON();

                delete purchase.buyer.pin;
                delete purchase.buyer.password;
                delete purchase.seller.pin;
                delete purchase.seller.password;
                delete purchase.buyer.recoverKey;
                delete purchase.seller.recoverKey;

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
