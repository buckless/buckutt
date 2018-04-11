export default (a, b, order = 'ASC') => {
    const aLow = typeof a === 'string' ? a.toLowerCase() : a;
    const bLow = typeof b === 'string' ? b.toLowerCase() : b;

    if (aLow < bLow) {
        return order !== 'DESC' ? -1 : 1;
    }

    if (aLow > bLow) {
        return order !== 'DESC' ? 1 : -1;
    }

    return 0;
};
