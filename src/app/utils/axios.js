import axios from 'axios';
import msgpack from 'msgpack-lite';
import uuid from 'uuid';

let inst;
let base;

export default baseURL => {
    if (inst && base === baseURL) {
        return inst;
    }

    base = baseURL;
    inst = axios.create({
        baseURL,
        headers: {
            Accept: '',
            'Accept-Language': ''
        },
        transformRequest: [
            (data, headers) => {
                if (data) {
                    headers['Content-Type'] = 'application/x-msgpack';
                    headers['Idempotency-Key'] = headers['Idempotency-Key'] || uuid();

                    return msgpack.encode(data);
                }

                return data;
            }
        ]
    });

    return inst;
};
