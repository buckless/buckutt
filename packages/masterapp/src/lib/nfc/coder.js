import DataCoder from './dataCoder';

let dataCoder;

export default () => {
    if (dataCoder) {
        return dataCoder;
    }

    const articles = Object.values(JSON.parse(process.env.VUE_APP_ARTICLES)).sort(
        (a, b) => a.id - b.id
    );

    // The first bit is used by assignedCard parameter, the second by the lock state, the third by the paid state
    const usefulDataLength = articles.reduce((a, b) => a + b.maxNumber.toString(2).length, 3);
    const optionsLength = Math.ceil(usefulDataLength / 8) * 8;

    const byteNumber = optionsLength / 8;

    dataCoder = new DataCoder([
        {
            name: 'credit',
            default: '000000',
            size: 3,
            encode: number => number.toString(16),
            decode: data => parseInt(data, 16)
        },
        {
            name: 'version',
            default: '0000',
            size: 2,
            encode: number => number.toString(16),
            decode: data => parseInt(data, 16)
        },
        {
            name: 'options',
            default: '00'.repeat(byteNumber),
            size: byteNumber,
            encode: options => {
                /**
                 * {
                 *   assignedCard: Boolean,
                 *   locked: Boolean,
                 *   paidCard: Boolean,
                 *   catering: [
                 *     {
                 *       id: string,
                 *       balance: number
                 *     }
                 *   ]
                 * }
                 */

                // Set the first bit depending on the card assignation
                let data = options.assignedCard ? '1' : '0';

                // Set the second bit depending on the lock state
                data += options.locked ? '1' : '0';

                // Set the third bit depending on the paid state
                data += options.paidCard ? '1' : '0';

                articles.forEach(article => {
                    const userCatering = options.catering.find(entry => entry.id === article.id);

                    if (!userCatering) {
                        data += '0'.padStart(article.maxNumber.toString(2).length, '0');
                    } else {
                        data += userCatering.balance
                            .toString(2)
                            .padStart(article.maxNumber.toString(2).length, '0');
                    }
                });

                return parseInt(data.padEnd(optionsLength, '0'), 2).toString(16);
            },
            decode: data => {
                const binaryOptions = parseInt(data, 16).toString(2)
                    .padStart(optionsLength, '0')
                    .substr(-usefulDataLength);

                const options = {
                    assignedCard: binaryOptions.charAt(0) === '1',
                    locked: binaryOptions.charAt(1) === '1',
                    paidCard: binaryOptions.charAt(2) === '1',
                    catering: []
                };

                let articleIndex = 3;
                articles.forEach(article => {
                    const articleSize = article.maxNumber.toString(2).length;
                    const articleBits = binaryOptions.substr(articleIndex, articleSize);
                    const balance = parseInt(articleBits.substr(0, articleBits.length), 2);
                    options.catering.push({
                        id: article.id,
                        balance
                    });
                    articleIndex += articleSize;
                });

                return options;
            }
        }
    ]);

    return dataCoder;
};
