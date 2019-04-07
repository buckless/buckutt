export default (obj, ignore) => {
    const res = {};

    for (let [key, val] of Object.entries(obj)) {
        if (!ignore.includes(key)) {
            res[key] = val;
        }
    }

    return res;
};
