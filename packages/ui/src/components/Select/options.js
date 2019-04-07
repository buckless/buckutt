export const hasKey = (obj, key) => ({}.hasOwnProperty.call(obj, key));

export const validator = values => {
    if (!Array.isArray(values)) {
        return false;
    }

    return values
        .map(obj => {
            if (typeof obj === 'string') {
                return true;
            }

            if (hasKey(obj, 'value') && hasKey(obj, 'name')) {
                return true;
            }

            return false;
        })
        .reduce((left, right) => left && right, true);
};

export const normalize = values =>
    values.map(value => (typeof value === 'string' ? { value, name: value } : value));
