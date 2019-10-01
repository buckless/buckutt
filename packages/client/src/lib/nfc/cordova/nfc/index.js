import { EventEmitter } from 'events';
import { UltralightC } from './ultralight-c';
const debug = require('debug')('nfc:cordova:nfc:index');

export default class NFCReader extends EventEmitter {
    constructor() {
        super();

        this.ultralightC = new UltralightC();

        this.ultralightC.on('uid', uid => this.emit('uid', uid));
        this.ultralightC.on('cardType', cardType => this.emit('cardType', cardType));
        this.ultralightC.on('atr', atr => this.emit('atr', atr));
        this.ultralightC.on('error', err => this.emit('error', err));
        this.ultralightC.on('shouldResetCard', shouldResetCard =>
            this.emit('shouldResetCard', shouldResetCard)
        );
        this.ultralightC.on('data', data => {
            debug('data event', data);
            this.emit('data', data);
        });
    }

    write(data) {
        console.timeEnd('NFC Write');
        return this.ultralightC.write(data);
    }
}
