const { EventEmitter } = require('events');
const rusha = require('rusha');
const { encode, decode } = require('@buckless/signed-number');

module.exports = class NFC extends EventEmitter {
    constructor() {
        super();

        console.warn('NFC is mocked in browser');
        this.emit('reader');

        window.mock = {
            actualCard: ''
        };

        window.mock.addCard = (name, cardId, cardValue) => {
            // do not store cardValue as buffer because it can't be restored as a buffer
            if (typeof cardValue !== 'number') {
                throw new Error('cardValue should not be passed into nfc.creditToData');
            }

            if (cardId.length === 0) {
                throw new Error('cardId should bet set');
            }

            if (name.length === 0) {
                throw new Error('name should bet set');
            }

            console.warn(`Writing card ${name} to local storage : ${cardId}(${cardValue})`);

            const cards = localStorage.hasOwnProperty('mocked-cards')
                ? JSON.parse(localStorage.getItem('mocked-cards'))
                : {};

            cards[name] = {
                cardId,
                cardValue
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

            mock.actualCard = name;

            // do not store cardValue as buffer because it can't be restored as a buffer
            // we create the buffer directly on read
            cards[name].cardValue = nfc.creditToData(cards[name].cardValue, cards[name].cardId + config.signingKey);

            this.emit('uid', cards[name].cardId);
            this.emit('atr', '0');
            this.emit('cardType', 'mockedCard');
            this.emit('data', cards[name].cardValue);
        };

        window.mock.print = () => {
            if (!localStorage.hasOwnProperty('mocked-cards')) {
                throw new Error('You need to use mock.addCard to create a mocked card first');
            }

            const cards = JSON.parse(localStorage.getItem('mocked-cards'));

            console.log(cards);
        };

        window.mock.clean = () => {
            localStorage.removeItem('mocked-cards');
        };
    }

    write(data) {
        const cards = JSON.parse(localStorage.getItem('mocked-cards'));

        if (!cards[mock.actualCard]) {
            return Promise.reject(new Error('card not found'));
        }

        // do not store cardValue as buffer because it can't be restored as a buffer
        cards[mock.actualCard].cardValue = nfc.dataToCredit(data, cards[mock.actualCard].cardId + config.signingKey);

        const debugData = `${cards[mock.actualCard].cardId}(${cards[mock.actualCard].cardValue})`;
        console.warn(`Writing card to local storage : ${debugData}`);

        localStorage.setItem('mocked-cards', JSON.stringify(cards));

        return Promise.resolve();
    }

    dataToCredit(data, signingKey) {
        return decode(data, signingKey, rusha.createHash);
    }

    creditToData(credit, signingKey) {
        return encode(credit, signingKey, 7, rusha.createHash);
    }
};
