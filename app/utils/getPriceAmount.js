module.exports = (Price, id) =>
    Price.where({ id })
        .fetch()
        .then(price => price.get('amount'));
