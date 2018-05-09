import { SignedData } from '@buckless/signed-data';
import rusha from 'rusha';

const duration = process.env.VUE_APP_CATERING_DAYS;
const articles = Object.values(JSON.parse(process.env.VUE_APP_ARTICLES)).sort(
    (a, b) => a.id - b.id
);

// The first bit is used by assignedCard parameter
const usefulDataLength = articles.reduce(
    (a, b) => a + b.maxNumber.toString(2).length + duration,
    1
);
const optionsLength = Math.ceil(usefulDataLength / 8) * 8;

const byteNumber = optionsLength / 8;

export default new SignedData(process.env.VUE_APP_SIGNINGKEY, 8, rusha.createHash, [
    {
        name: 'credit',
        default: '000000',
        size: 3,
        encode: number => number.toString(16),
        decode: data => parseInt(data, 16)
    },
    {
        name: 'options',
        default: '00'.repeat(byteNumber),
        size: byteNumber,
        encode: options => {
            console.log('signeddata-encode', options);
            /**
             * {
             *   assignedCard: Boolean,
             *   catering: [
             *     {
             *       id: string,
             *       balance: number,
             *       validity: Array<Boolean>
             *     }
             *   ]
             * }
             */

            // Set the first bit depending on the card assignation
            let data = options.assignedCard ? '1' : '0';

            articles.forEach(article => {
                const userCatering = options.catering.find(entry => entry.id === article.id);

                if (!userCatering) {
                    // Write 0 for balance and validity
                    data += '0'.padStart(article.maxNumber.toString(2).length + duration, '0');
                } else {
                    let articleBits = userCatering.balance
                        .toString(2)
                        .padStart(article.maxNumber.toString(2).length, '0');

                    for (let i = 0; i < duration; i++) {
                        articleBits += userCatering.validity[i] ? '1' : '0';
                    }

                    data += articleBits;
                }
            });

            return parseInt(data, 2).toString(16);
        },
        decode: data => {
            const binaryOptions = parseInt(data, 16)
                .toString(2)
                .padStart(optionsLength, '0')
                .substr(-usefulDataLength);

            const options = {
                assignedCard: binaryOptions.charAt(0) === '1',
                catering: []
            };

            let articleIndex = 1;
            articles.forEach(article => {
                const articleSize = article.maxNumber.toString(2).length + duration;
                const articleBits = binaryOptions.substr(articleIndex, articleSize);
                const balance = parseInt(articleBits.substr(0, articleBits.length - duration), 2);
                const validity = articleBits
                    .substr(-duration)
                    .split('')
                    .map(bit => bit === '1');
                options.catering.push({
                    id: article.id,
                    balance,
                    validity
                });
                articleIndex += articleSize;
            });

            return options;
        }
    }
]);
