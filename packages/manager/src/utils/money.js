export const format = ({ amount, currency = 'EUR', language = 'fr-FR', showPlus = false }) => {
    const formatted = new Intl.NumberFormat(language, { style: 'currency', currency }).format(
        amount / 100
    );

    if (amount >= 0 && showPlus) {
        return `+${formatted}`;
    }

    return formatted;
};

export const isValid = input => {
    if (typeof input === 'number') {
        return true;
    }

    if (typeof input === 'string') {
        return /^\d+([.,]\d{1,2})?$/.test(input);
    }

    return false;
};
