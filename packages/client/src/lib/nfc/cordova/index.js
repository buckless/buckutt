import { EventEmitter } from 'events';
import NFCReader from './nfc';
import dataCoder from '../coder';
const debug = require('debug')('nfc:cordova:index');

class NFC extends EventEmitter {
    constructor() {
        super();

        this.nfc = new NFCReader();

        this.nfc.on('log', log => this.emit('log', log));
        this.nfc.on('error', err => this.emit('error', err));
        this.nfc.on('reader', () => this.emit('reader'));
        this.nfc.on('uid', uid => this.emit('uid', uid));
        this.nfc.on('atr', atr => this.emit('atr', atr));
        this.nfc.on('cardType', cardType => this.emit('cardType', cardType));
        this.nfc.on('locked', locked => this.emit('locked', locked));
        this.nfc.on('data', data => {
            debug('data event', data);
            this.emit('data', data);
        });
    }

    shouldLock(lock) {
        this.nfc.shouldLock(lock);
    }

    shouldUnlock(unlock) {
        this.nfc.shouldUnlock(unlock);
    }

    write(data) {
        return this.nfc.write(data);
    }

    dataToCard(data) {
        return dataCoder().decode(data);
    }

    cardToData(data) {
        return dataCoder().encode(data);
    }
}

export default NFC;
