import axios from 'axios';
import msgpack from 'msgpack-lite';

const inst = axios.create({
    baseURL: config.api,
    headers: {
        Accept: '',
        'Accept-Language': ''
    },
    transformRequest: [
        (data, headers) => {
            if (data) {
                headers['Content-Type'] = 'application/x-msgpack';

                return msgpack.encode(data);
            }

            return data;
        }
    ]
});

export default inst;
