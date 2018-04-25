module.exports = (req, res, next) => {
    const original_write = res.write;
    const original_end = res.end;
    const chunks = [];

    res.write = function(chunk) {
        chunks.push(chunk);
        original_write.apply(res, arguments);
    };

    res.end = function(chunk) {
        if (chunk) {
            chunks.push(chunk);
        }

        res.body = Buffer.concat(chunks).toString('utf8');
        original_end.apply(res, arguments);
    };

    next();
};
