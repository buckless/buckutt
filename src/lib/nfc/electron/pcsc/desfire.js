const crypto = require('crypto');

function decrypt(key, data, iv = Buffer.alloc(8).fill(0)) {
    const decipher = crypto.createDecipheriv('DES-EDE-CBC', key, iv);
    decipher.setAutoPadding(false);

    return Buffer.concat([decipher.update(data), decipher.final()]);
}

function encrypt(key, data, iv = Buffer.alloc(8).fill(0)) {
    const cipher = crypto.createCipheriv('DES-EDE-CBC', key, iv);
    cipher.setAutoPadding(false);

    return Buffer.concat([cipher.update(data), cipher.final()]);
}

function wrap(code, data) {
    return Buffer.from([0x90, code, 0x00, 0x00, data.length, ...data, 0x00]);
}

export function read(transmit, log, callback) {
    const appId = window.config.desfire.appId;
    const fileId = window.config.desfire.fileId;
    const keyId = window.config.desfire.keyId;
    const dkey = window.config.desfire.key;

    log(`out: ${wrap(0x5a, appId).toString('hex')}`);
    return transmit(wrap(0x5a, appId), 40)
        .then(data => {
            log(`res: ${data.toString('hex')}`);
            if (data[0] !== 0x91) {
                return false;
            }

            log(`out: ${wrap(0x1a, keyId).toString('hex')}`);
            return transmit(wrap(0x1a, keyId), 40);
        })
        .then(data => {
            log(`res: ${data.toString('hex')}`);
            if (data.length !== 10 || data[data.length - 2] !== 0x91) {
                throw new Error(`Error code: ${data.toString('hex')} in step keyId`);
            }

            const ekRndB = data.slice(0, -2);
            const key = Buffer.from(dkey, 'hex');
            const RndB = decrypt(key, ekRndB);
            const RndBp = Buffer.concat([RndB.slice(1, 8), RndB.slice(0, 1)]);
            const RndA = crypto.randomBytes(8);
            const msg = encrypt(key, Buffer.concat([RndA, RndBp]), ekRndB);

            log(`out: ${wrap(0xaf, msg).toString('hex')}`);
            return Promise.all([transmit(wrap(0xaf, msg), 40), RndA, msg]);
        })
        .then(([data, RndA, msg]) => {
            log(`res: ${data.toString('hex')}`);
            if (data.length !== 10 || data[data.length - 2] !== 0x91) {
                throw new Error(
                    `Error code: ${data.toString('hex')} in step random key transmission`
                );
            }

            const ekRndAp = data.slice(0, -2);
            const key = Buffer.from(dkey, 'hex');
            const RndAp = decrypt(key, ekRndAp, msg.slice(8, 16));
            const RndA2 = Buffer.concat([RndAp.slice(7, 8), RndAp.slice(0, 7)]);

            if (!RndA.equals(RndA2)) {
                throw new Error("Error: can't match random bytes");
            }

            log(`out: ${wrap(0xbd, fileId).toString('hex')}`);
            return transmit(wrap(0xbd, fileId), 255);
        })
        .then(data => {
            log(`res: ${data.toString('hex')}`);
            if (data[data.length - 1] !== 0x00 && data[data.length - 2] !== 0x91) {
                throw new Error(`Error code: ${data.toString('hex')} in step fileI`);
            }

            callback(
                data
                    .slice(0, 15)
                    .toString()
                    .replace(/\D+/g, '')
            );
            return true;
        });
}

export function write() {}

export const ATR = Buffer.from([0x3b, 0x81, 0x80, 0x01, 0x80, 0x80]);
