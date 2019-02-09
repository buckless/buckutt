const msgpack = require('msgpack-lite');

const mime = 'application/x-msgpack';

const shouldMsgPack = req => req.get('accept') === mime;

module.exports = (req, res, next) => {
    if (shouldMsgPack(req)) {
        res.json = obj => {
            const encoded = msgpack.encode(obj);
            res.setHeader('Content-Type', 'application/x-msgpack');
            res.setHeader('Content-Length', encoded.length);
            res.send(encoded);
        };
    }

    next();
};
