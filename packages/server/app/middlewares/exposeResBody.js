// exposes json data sent through res.json() on req 'finish' event
module.exports = (req, res, next) => {
    const oldResJson = res.json.bind(res);

    res.json = obj => {
        res.body = obj;
        return oldResJson(obj);
    };

    next();
};
