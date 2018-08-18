import axios from "axios";
import msgpack from "msgpack-lite";
import uuid from "uuid";

const inst = axios.create({
    baseURL: config.api,
    headers: {
        Accept: "",
        "Accept-Language": ""
    },
    transformRequest: [
        (data, headers) => {
            if (data) {
                headers["Content-Type"] = "application/x-msgpack";
                headers["Idempotency-Key"] = uuid();

                return msgpack.encode(data);
            }

            return data;
        }
    ]
});

export default inst;
