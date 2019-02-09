module.exports = n => {
    const str = String(n);

    return str.length === 1 ? `0${str}` : str;
};
