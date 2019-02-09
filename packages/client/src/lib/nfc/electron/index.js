import { EventEmitter } from 'events';
import PCSCReader from './pcsc';

const dataCoder = require('../coder');

class NFC extends EventEmitter {
    constructor() {
        super();
        this.pcsc = new PCSCReader();
        this.nfc = null; // new NFCReader();

        this.pcsc.on('log', log => this.emit('log', log));
        this.pcsc.on('error', err => this.emit('error', err));
        this.pcsc.on('reader', () => this.emit('reader'));
        this.pcsc.on('uid', uid => this.emit('uid', uid));
        this.pcsc.on('atr', atr => this.emit('atr', atr));
        this.pcsc.on('cardType', cardType => this.emit('cardType', cardType));
        this.pcsc.on('data', data => this.emit('data', data));
    }

    write(data) {
        return this.pcsc.write(data);
    }

    dataToCard(data) {
        return dataCoder().decode(data);
    }

    cardToData(data) {
        return dataCoder().encode(data);
    }
}

export default NFC;
