const { EventEmitter } = require('events');
const rusha = require('rusha');
const signedData = require('../signedData');

module.exports = class NFC extends EventEmitter {
    constructor() {
        super();

        console.warn('NFC is mocked in browser');
        this.emit('reader');

        window.mock = {
            actualCard: ''
        };

        window.mock.addCard = (name, cardId, credit) => {
            // do not store credit as buffer because it can't be restored as a buffer
            if (typeof credit !== 'number') {
                throw new Error('credit should not be passed into nfc.cardToData');
            }

            if (cardId.length === 0) {
                throw new Error('cardId should bet set');
            }

            if (name.length === 0) {
                throw new Error('name should bet set');
            }

            console.warn(`Writing card ${name} to local storage : ${cardId}(${credit})`);

            const cards = localStorage.hasOwnProperty('mocked-cards')
                ? JSON.parse(localStorage.getItem('mocked-cards'))
                : {};

            cards[name] = {
                cardId,
                cardValue: {
                    credit,
                    options: {
                        assignedCard: 1,
                        catering: [
                            {
                                id: 0,
                                balance: 2,
                                validity: [true, true, true, true]
                            }
                        ]
                    }
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

            mock.actualCard = name;

            // do not store cardValue as buffer because it can't be restored as a buffer
            // we create the buffer directly on read
            cards[name].cardValue = nfc.cardToData(cards[name].cardValue, cards[name].cardId + config.signingKey);

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
        cards[mock.actualCard].cardValue = nfc.dataToCard(data, cards[mock.actualCard].cardId + config.signingKey);

        const debugData = `${cards[mock.actualCard].cardId}(${
            cards[mock.actualCard].cardValue.credit
        })`;
        console.warn(`Writing card to local storage : ${debugData}`);

        localStorage.setItem('mocked-cards', JSON.stringify(cards));

        return Promise.resolve();
    }

    dataToCard(data, signingKey) {
        return signedData.key(signingKey).decode(data);
    }

    cardToData(data, signingKey) {
        return signedData.key(signingKey).encode(data);
    }
};
