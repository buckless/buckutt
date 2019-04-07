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

            if (hasKey(obj, 'id') && hasKey(obj, 'title')) {
                return true;
            }

            return false;
        })
        .reduce((left, right) => left && right, true);
};
