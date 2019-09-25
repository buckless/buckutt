const defaultFormatOptions = {
    currency: 'EUR',
    language: 'fr-FR'
};

export const format = (cents, { currency, language } = defaultFormatOptions) => {
    if (typeof cents !== 'number') {
        throw new TypeError('format expects a `number` as first argument');
    }

    return (cents / 100).toLocaleString(language, {
        style: 'currency',
        currency
    });
};
