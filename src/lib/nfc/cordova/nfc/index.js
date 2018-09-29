import EventEmitter from 'events';
import UltralightC from './ultralight-c';

export default class NFCReader extends EventEmitter {
    constructor() {
        super();

        console.log('lib-nfc-cordova-nfc-index-constructor');

        this.ultralightC = new UltralightC();

        this.ultralightC.on('uid', uid => this.emit('uid', uid));
        this.ultralightC.on('cardType', cardType => this.emit('cardType', cardType));
        this.ultralightC.on('atr', atr => this.emit('atr', atr));
        this.ultralightC.on('data', data => this.emit('data', data));
        this.ultralightC.on('error', err => this.emit('error', err));
        this.ultralightC.on('locked', locked => this.emit('locked', locked));
    }

    write(data) {
        console.timeEnd('NFC Write');
        return this.ultralightC.write(data);
    }

    shouldLock(lock) {
        this.ultralightC.shouldLock(lock);
    }

    shouldUnlock(unlock) {
        this.ultralightC.shouldUnlock(unlock);
    }
}
