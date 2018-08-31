import { EventEmitter } from 'events';
import signedData from '../signedData';
const debug = require('debug')('nfc:browser');

class NFC extends EventEmitter {
    constructor() {
        super();

        debug('NFC is mocked in browser');
        this.emit('reader');

        window.mock = {
            actualCard: ''
        };

        window.mock.addCard = (name, cardId, credit = 0, version = 0, options_) => {
            const options = Object.assign(
                {
                    assignedCard: true,
                    locked: false,
                    paidCard: false,
                    catering: []
                },
                options_
            );

            // do not store credit as buffer because it can't be restored as a buffer
            if (typeof credit !== 'number') {
                throw new Error('credit should not be passed into nfc.cardToData');
            }

            if (typeof version !== 'number') {
                throw new Error('version should not be passed into nfc.cardToData');
            }

            if (cardId.length === 0) {
                throw new Error('cardId should bet set');
            }

            if (name.length === 0) {
                throw new Error('name should bet set');
            }

            debug(`Writing card ${name} to local storage : ${cardId}(${credit})`);

            const cards = localStorage.hasOwnProperty('mocked-cards')
                ? JSON.parse(localStorage.getItem('mocked-cards'))
                : {};

            cards[name] = {
                cardId,
                cardValue: {
                    credit,
                    version,
                    options
                }
            };

            localStorage.setItem('mocked-cards', JSON.stringify(cards));
        };

        window.mock.scan = name => {
            if (!localStorage.hasOwnProperty('mocked-cards')) {
                throw new Error('You need to use mock.addCard to create a mocked card first');
            }

            if (name.length === 0) {
                throw new Error('name should bet set');
            }

            const cards = JSON.parse(localStorage.getItem('mocked-cards'));

            if (!cards.hasOwnProperty(name)) {
                throw new Error('card not found');
            }

            window.mock.actualCard = name;

            // do not store cardValue as buffer because it can't be restored as a buffer
            // we create the buffer directly on read
            cards[name].cardValue = window.nfc.cardToData(
                cards[name].cardValue,
                cards[name].cardId + config.signingKey
            );

            this.emit('uid', cards[name].cardId);
            this.emit('atr', '0');
            this.emit('cardType', 'mockedCard');
            this.emit('data', cards[name].cardValue);

            debug(`scan card ${name}`);
        };

        window.mock.print = () => {
            if (!localStorage.hasOwnProperty('mocked-cards')) {
                throw new Error('You need to use mock.addCard to create a mocked card first');
            }

            const cards = JSON.parse(localStorage.getItem('mocked-cards'));

            debug(cards);
        };

        window.mock.clean = () => {
            localStorage.removeItem('mocked-cards');
        };
    }

    write(data) {
        const cards = JSON.parse(localStorage.getItem('mocked-cards'));

        if (!cards[window.mock.actualCard]) {
            return Promise.reject(new Error('card not found'));
        }

        // do not store cardValue as buffer because it can't be restored as a buffer
        cards[window.mock.actualCard].cardValue = window.nfc.dataToCard(
            data,
            cards[window.mock.actualCard].cardId + config.signingKey
        );

        const debugData = `${cards[window.mock.actualCard].cardId}(${
            cards[window.mock.actualCard].cardValue.credit
        })`;
        debug(`Writing card to local storage : ${debugData}`);

        localStorage.setItem('mocked-cards', JSON.stringify(cards));

        return Promise.resolve();
    }

    dataToCard(data, signingKey) {
        return signedData.key(signingKey).decode(data);
    }

    cardToData(data, signingKey) {
        return signedData.key(signingKey).encode(data);
    }
}

const inst = new NFC();

export default inst;
