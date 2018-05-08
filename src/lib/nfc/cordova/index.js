const { EventEmitter } = require('events');
const NFCReader = require('./nfc');
const signedData = require('../signedData');

module.exports = class NFC extends EventEmitter {
    constructor() {
        super();

        this.nfc = new NFCReader();

        this.nfc.on('log', log => this.emit('log', log));
        this.nfc.on('error', err => this.emit('error', err));
        this.nfc.on('reader', () => this.emit('reader'));
        this.nfc.on('uid', uid => this.emit('uid', uid));
        this.nfc.on('atr', atr => this.emit('atr', atr));
        this.nfc.on('cardType', cardType => this.emit('cardType', cardType));
        this.nfc.on('data', data => this.emit('data', data));
    }

    write(data) {
        return this.nfc.write(data);
    }

    dataToCard(data, signingKey) {
        return signedData.key(signingKey).decode(data);
    }

    cardToData(data, signingKey) {
        return signedData.key(signingKey).encode(data);
    }
};
