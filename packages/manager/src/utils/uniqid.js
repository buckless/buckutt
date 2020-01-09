let counters = {};

export const generate = prefix => {
    if (!counters.hasOwnProperty(prefix)) {
        counters[prefix] = -1;
    }

    counters[prefix] += 1;

    return `${prefix}-${counters[prefix]}`;
};
