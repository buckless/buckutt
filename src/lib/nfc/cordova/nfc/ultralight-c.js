import EventEmitter from 'events';
import chunk from 'lodash.chunk';

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

        this.shouldLock_ = false;
        this.shouldUnlock_ = false;
        this.pin = parseInt(process.env.VUE_APP_PIN, 16);

        document.addEventListener('mifareTagDiscovered', tag => {
            console.log(tag);

            console.time('NFC Write');

            this.connect()
                .then(() => {
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
                    console.log(data);

                    const pages = chunk(data.split(''), 8);

                    // if (pages[12][7] === '4') {
                    //     alert('Card locked');
                    // }

                    this.emit('locked', pages[12][7] === '4');
                    this.emit('fulldata', data);
                    this.emit(
                        'data',
                        data.slice(0, parseInt(process.env.VUE_APP_ULTRALIGHT_CREDITSIZE, 10))
                    );
                })
                .catch(err => this.emit('error', err));
        });
    }

    shouldLock(lock) {
        this.shouldLock_ = lock;
    }

    shouldUnlock(unlock) {
        this.shouldUnlock_ = unlock;
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
        const firstWritablePage = JSON.parse(process.env.VUE_APP_ULTRALIGHT_FIRSTPAGE);
        const cardLength = process.env.VUE_APP_ULTRALIGHT_CARDLENGTH;

        const repeat = Math.ceil(cardLength / 4);

        let initialPromise = Promise.resolve();

        const bufs = [];

        // add 4 each time (read 16 bytes each time)
        for (let page = 4; page < repeat; page += 4) {
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
        const firstWritablePage = JSON.parse(process.env.VUE_APP_ULTRALIGHT_FIRSTPAGE);
        const cardLength = JSON.parse(process.env.VUE_APP_ULTRALIGHT_CARDLENGTH);
        const creditSize = JSON.parse(process.env.VUE_APP_ULTRALIGHT_CREDITSIZE);

        const dataLength = cardLength - firstWritablePage * 4;

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
        if (this.shouldUnlock_ && this.pin) {
            sequence = this.unlock(this.pin);
        }

        // Write in sequence
        i = 0;

        for (let page of subs) {
            sequence = sequence
                .then(() => {
                    return new Promise((resolve, reject) => {
                        window.mifare.write(
                            i + firstWritablePage,
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

        if (this.shouldLock_ && this.pin) {
            sequence = sequence.then(() => this.lock(this.pin));
        }

        return sequence.then(() => newBuf).catch(err => {
            throw new Error(`Write failed : ${err}`);
        });
    }

    async lock(pinData = 0x11223344) {
        let pin = this.intTo4BytesArray(pinData);

        try {
            console.log('write', '0x10', ['00', '00', '00', '04']);
            console.log('write', '0x11', ['00', '00', '00', '00']);
            console.log('write', '0x13', ['99', '99', '00', '00']);
            console.log('write', '0x12', pin);
            await window.mifare.write(0x10, ['00', '00', '00', '04']);
            await window.mifare.write(0x11, ['00', '00', '00', '00']);
            await window.mifare.write(0x13, ['99', '99', '00', '00']);
            await window.mifare.write(0x12, pin);
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
