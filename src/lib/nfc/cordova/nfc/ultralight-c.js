import EventEmitter from 'events';

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

export default class UltralightC extends EventEmitter {
    constructor() {
        super();
        console.log('lib-nfc-cordova-nfc-ultralight-c-constructor');

        document.addEventListener('mifareTagDiscovered', tag => {
            console.log('lib-nfc-cordova-nfc-ultralight-c-constructor EVENT');
            this.emit('uid', tag.tag.map(dec => dec.toString(16)).join(''));
            this.emit('log', tag.tag.map(dec => dec.toString(16)).join(''));
            this.emit('atr', ATR);
            this.emit('cardType', 'ultralightC');

            console.time('NFC Write');

            this.connect()
                .then(() => this.read())
                .then(data => {
                    this.emit(
                        'data',
                        data.slice(0, parseInt(process.env.VUE_APP_ULTRALIGHT_CREDITSIZE, 10))
                    );
                })
                .catch(err => {
                    console.log(err);
                });
        });
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            window.mifare.disconnect(
                () => {
                    resolve();
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    connect() {
        return new Promise((resolve, reject) => {
            window.mifare.connect(
                () => {
                    resolve();
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    read() {
        const firstWritablePage = parseInt(process.env.VUE_APP_ULTRALIGHT_FIRSTPAGE, 10);
        const cardLength = parseInt(process.env.VUE_APP_ULTRALIGHT_CARDLENGTH, 10);
        const creditSize = parseInt(process.env.VUE_APP_ULTRALIGHT_CREDITSIZE, 10);

        const repeat = Math.ceil(cardLength / 4);

        let initialPromise = Promise.resolve();

        const bufs = [];

        // add 4 each time (read 16 bytes each time)
        for (let page = 4; page < repeat; page += 4) {
            initialPromise = initialPromise.then(() => {
                return new Promise((resolve, reject) => {
                    window.mifare.read(
                        page,
                        res => {
                            bufs.push(res.data);
                            resolve();
                        },
                        err => {
                            console.log('err', err);
                            reject(err);
                        }
                    );
                });
            });
        }

        return initialPromise.then(() => bufs.join(''));
    }

    write(data) {
        const dataLength =
            parseInt(process.env.VUE_APP_ULTRALIGHT_CARDLENGTH, 10) -
            parseInt(process.env.VUE_APP_ULTRALIGHT_FIRSTPAGE, 10) * 4;

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
                    return new Promise((resolve, reject) => {
                        window.mifare.write(
                            i + parseInt(process.env.VUE_APP_ULTRALIGHT_FIRSTPAGE, 10),
                            Array.from(page).map(int => int.toString(16)),
                            res => resolve(res),
                            err => {
                                console.log('error from write', err);
                                reject(err);
                            }
                        );
                    });
                })
                .then(res => {
                    i = i + 1;
                });
        }

        return sequence.then(() => newBuf).catch(err => {
            throw new Error(`Write failed : ${err}`);
        });
    }
}
