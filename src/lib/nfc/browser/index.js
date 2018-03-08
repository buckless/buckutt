const { EventEmitter }   = require('events');
const rusha              = require('rusha');
const { encode, decode } = require('@buckless/signed-number');

module.exports = class NFC extends EventEmitter {
    constructor() {
        super();

        console.warn('NFC is mocked in browser');
        this.emit('reader');

        window.mock = {};

        window.mock.storeCard = (cardId, cardValue) => {
            // do not store cardValue as buffer because it can't be restored as a buffer
            if (typeof cardValue !== 'number') {
                throw new Error('cardValue should not be passed into nfc.creditToData');
            }

            if (cardId.length > 0) {
                console.warn(`Writing card to local storage : ${cardId}(${cardValue})`);

                localStorage.setItem('mocked-card', JSON.stringify({
                    cardId,
                    cardValue
                }));
            }
        };

        window.mock.scan = () => {
            if (!localStorage.hasOwnProperty('mocked-card')) {
                throw new Error('You need to use mock.storeCard to create a mocked card first');
            }

            const mock = JSON.parse(localStorage.getItem('mocked-card'));

            // do not store cardValue as buffer because it can't be restored as a buffer
            // we create the buffer directly on read
            mock.cardValue = nfc.creditToData(mock.cardValue, config.signingKey);

            this.emit('uid', mock.cardId);
            this.emit('atr', '0');
            this.emit('cardType', 'mockedCard');
            this.emit('data', mock.cardValue);
        };

        window.mock.print = () => {
            if (!localStorage.hasOwnProperty('mocked-card')) {
                throw new Error('You need to use mock.storeCard to create a mocked card first');
            }

            const mock = JSON.parse(localStorage.getItem('mocked-card'));

            console.log(mock);
        };
    }

    write(data) {
        const mock = JSON.parse(localStorage.getItem('mocked-card'));

        // do not store cardValue as buffer because it can't be restored as a buffer
        mock.cardValue = nfc.dataToCredit(data, config.signingKey);

        console.warn(`Writing card to local storage : ${mock.cardId}(${mock.cardValue})`);

        localStorage.setItem('mocked-card', JSON.stringify({ cardId: mock.cardId, cardValue: mock.cardValue }));
    }

    dataToCredit(data, signingKey) {
        return decode(data, signingKey, rusha.createHash);
    }

    creditToData(credit, signingKey) {
        return encode(credit, signingKey, 7, rusha.createHash);
    }
}
