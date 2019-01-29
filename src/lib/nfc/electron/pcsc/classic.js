export function read(transmit, log, callback) {
    return transmit(Buffer.from(JSON.parse(window.config.classic.fileId)), 40).then(data => {
        const code = data.toString().replace(/\D+/g, '');

        if (code.length > 0) {
            callback(code);

            return true;
        }

        return false;
    });
}

export function write() {}

export const ATR = Buffer.from([
    0x3b,
    0x8f,
    0x80,
    0x01,
    0x80,
    0x4f,
    0x0c,
    0xa0,
    0x00,
    0x00,
    0x03,
    0x06,
    0x03,
    0x00,
    0x01,
    0x00,
    0x00,
    0x00,
    0x00,
    0x6a
]);
