const EventEmitter = require('events');
const { chunk } = require('lodash/array');
const debug = require('debug')('nfc:cordova:nfc:ultralight');

export class UltralightC extends EventEmitter {
    constructor() {
        super();

        this.shouldLock = false;

        document.addEventListener('mifareTagDiscovered', tag => {
            debug('tag discovered', tag);

            console.time('NFC Write');
            this.connect()
                .then(() => {
                    debug('connect succeeded');
                    this.emit(
                        'uid',
                        tag.tag.map(dec => dec.toString(16).padStart(2, '0')).join('')
                    );
                    this.emit(
                        'log',
                        tag.tag.map(dec => dec.toString(16).padStart(2, '0')).join('')
                    );
                    this.emit('atr', ATR);
                    this.emit('cardType', 'ultralightC');

                    return this.read();
                })
                .then(data => {
                    const pages = chunk(data.split(''), 8);
                    debug('read succeeded', pages);

                    const shouldUnlock = pages[12][7] === '4';
                    const pin = parseInt(window.config.ultralight.pin, 16);
                    const oldPins = window.config.ultralight.oldPins || [];
                    let useCurrentPin = false;

                    let sequence = Promise.resolve();

                    if (shouldUnlock) {
                        sequence = sequence
                            .then(() => this.unlock(pin))
                            .then(() => {
                                useCurrentPin = true;
                            });
                        oldPins.forEach(pinToTry => {
                            sequence = sequence.catch(() =>
                                this.disconnect()
                                    .then(() => this.connect())
                                    .then(() => this.unlock(parseInt(pinToTry, 16)))
                            );
                        });
                    }

                    return sequence.then(() => {
                        this.shouldLock = (!useCurrentPin && shouldUnlock) || !shouldUnlock;
                        debug('should lock card', this.shouldLock);
                        this.emit('shouldResetCard', this.shouldLock);
                        this.emit('data', data);
                    });
                })
                .catch(err => {
                    debug('connect/read/emit error', err);
                    this.emit('error', err);
                });
        });
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            window.mifare.disconnect(() => resolve(), err => reject(err));
        });
    }

    connect() {
        return new Promise((resolve, reject) => {
            window.mifare.connect(() => resolve(), err => reject(err));
        });
    }

    read() {
        const { firstWritablePage, cardLength } = window.config.ultralight;

        const repeat = Math.ceil(cardLength / 4);

        let initialPromise = Promise.resolve();

        const bufs = [];

        // add 4 each time (read 16 bytes each time)
        for (let page = firstWritablePage; page < repeat; page += 4) {
            initialPromise = initialPromise
                .then(() => this._readPage(page))
                .then(data => bufs.push(data));
        }

        return initialPromise.then(() => bufs.join(''));
    }

    _readPage(page) {
        return new Promise((resolve, reject) => {
            window.mifare.read(
                page,
                res => {
                    resolve(res.data);
                },
                err => {
                    console.log('err', err);
                    reject(err);
                }
            );
        });
    }

    write(data) {
        const pin = parseInt(window.config.ultralight.pin, 16);
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
                    return new Promise((resolve, reject) => {
                        window.mifare.write(
                            i + window.config.ultralight.firstWritablePage,
                            Array.from(page).map(int => int.toString(16)),
                            res => resolve(res),
                            err => {
                                console.log('error from write', err);
                                reject(err);
                            }
                        );
                    });
                })
                .then(() => {
                    i = i + 1;
                });
        }

        if (this.shouldLock && pin) {
            sequence = sequence.then(() => this.lock(pin));
        }

        return sequence
            .then(() => newBuf)
            .catch(err => {
                throw new Error(`Write failed : ${err}`);
            });
    }

    async lock(pinData = 0x11223344) {
        let pin = this.intTo4BytesArray(pinData);

        try {
            await window.mifare.write(0x11, ['00', '00', '00', '00']);
            await window.mifare.write(0x13, ['99', '99', '00', '00']);
            await window.mifare.write(0x12, pin);
            await window.mifare.write(0x10, ['00', '00', '00', '04']);
        } catch (err) {
            console.error('got err during write', err);
            return Promise.reject(err);
        }
    }

    intTo4BytesArray(int) {
        const bytes = [];
        let i = 4;

        do {
            i = i - 1;
            bytes[i] = (int & 255).toString('16');
            int = int >> 8;
        } while (i);

        return bytes;
    }

    unlock(pin) {
        return new Promise((resolve, reject) => {
            window.mifare.unlock(pin, () => resolve(), err => reject(err));
        });
    }
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
