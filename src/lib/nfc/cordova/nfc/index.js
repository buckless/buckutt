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
    }

    write(data) {
        console.timeEnd('NFC Write');
        return this.ultralightC.write(data);
    }
}
