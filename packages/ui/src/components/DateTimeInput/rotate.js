export default (arr, count) => {
    const len = arr.length;

    count = ((count % len) + len) % len;

    const last = arr.slice(count);
    const first = arr.splice(0, count);

    return last.concat(first);
};
