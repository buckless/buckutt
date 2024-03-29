export function read(transmit, log, callback) {
    const readBuf = Buffer.from([0xff, 0xb0, 0x00, 0x00, window.config.ultralight.cardLength]);

    log(`out: ${readBuf.toString('hex')}`);
    return transmit(readBuf).then(data => {
        // remove first pages (uid, etc.) and success code
        data = data.slice(config.ultralight.firstWritablePage * 4, -2).toString('hex');

        callback(data);
    });
}

export function write(data, transmit, log) {
    const dataLength =
        window.config.ultralight.cardLength - window.config.ultralight.firstWritablePage * 4;

    const buf = Buffer.from(data);
    const newBuf = Buffer.alloc(dataLength, 0);
    const subs = [];

    // Copy data inside our fixed-length buffer (length must be divisible by 4)
    for (let i = 0; i < dataLength; ++i) {
        newBuf[i] = buf[i] || 0;
    }

    /**
     * Generate buffers, 4 bytes length, to fill ultralight pages
     */
    let i = 0;
    do {
        const subBuf = Buffer.alloc(4, 0);

        subBuf[0] = newBuf[i + 0];
        subBuf[1] = newBuf[i + 1];
        subBuf[2] = newBuf[i + 2];
        subBuf[3] = newBuf[i + 3];

        subs.push(subBuf);

        i = i + 4;
    } while (i <= buf.length);

    let sequence = Promise.resolve();

    // Write in sequence
    i = 0;

    for (let page of subs) {
        sequence = sequence
            .then(() => {
                const writeBuf = Buffer.from([
                    0xff,
                    0xd6,
                    0x00,
                    i + window.config.ultralight.firstWritablePage,
                    0x04,
                    ...page
                ]);
                log(`out: ${writeBuf.toString('hex')}`);
                return transmit(writeBuf);
            })
            .then(res => {
                log(`res: ${res.toString('hex')}`);
                if (res.toString('hex') !== '9000') {
                    throw new Error(`Write failed : ${res.toString('hex')}`);
                }

                i = i + 1;
            })
            .catch(err => {
                throw new Error(`Write failed : ${err}`);
            });
    }

    return sequence.then(() => newBuf);
}

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
    0x03,
    0x00,
    0x00,
    0x00,
    0x00,
    0x68
]);
