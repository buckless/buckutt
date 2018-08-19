import Vue from 'vue';

export const formatCurrency = value => {
    if (typeof value !== 'number') {
        value = parseInt(value, 10);
    }

    if (!Number.isNaN(value)) {
        return `${value.toFixed(2).replace('.', ',')}€`;
    }

    return '';
};

Vue.filter('currency', formatCurrency);
