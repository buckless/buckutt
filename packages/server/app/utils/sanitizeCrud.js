module.exports = (model, results) => {
    if (model === 'users') {
        return results.map(result => {
            result.pin = '';
            result.password = '';

            return result;
        });
    } else if (model === 'transactions') {
        return results.map(result => {
            result.cardToken = '';
            result.cardExpiration = '';
            result.cardType = '';

            return result;
        })
    }

    return results;
};
