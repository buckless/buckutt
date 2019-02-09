import Vue from 'vue';

export function parsePrice(price, divide) {
    if (!price) {
        return '0.00€';
    }

    const newCredit = (divide ? price / 100 : price).toFixed(2);

    return `${newCredit}€`;
}

Vue.filter('price', (price, divide) => parsePrice(price, divide));
