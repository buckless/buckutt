export default class DataCoder {
    constructor(scheme = []) {
        this.scheme = scheme;
        this.dataSize = this.scheme.map(p => p.size).reduce((a, b) => a + b, 0);
    }

    encode(data) {
        let value = '';

        for (let i = 0; i < this.scheme.length; i++) {
            const part = this.scheme[i];

            let result = data.hasOwnProperty(part.name)
                ? part.encode(data[part.name])
                : part.default;

            if (result.length > part.size * 2) {
                throw new Error(`[signed-data] encoder ${part.name} output a value too long`);
            } else {
                // left-pad
                result = ('0'.repeat(part.size * 2) + result).slice(-1 * part.size * 2);
            }

            value += result;
        }

        return Buffer.from(value.slice(0, this.dataSize * 2), 'hex');
    }

    decode(raw) {
        let value = {};

        let startIndex = 0;

        if (Buffer.isBuffer(raw)) {
            raw = raw.toString('hex');
        }

        raw = raw.slice(0, this.dataSize * 2);

        for (let i = 0; i < this.scheme.length; i++) {
            const part = this.scheme[i];

            const data = part.decode(raw.slice(startIndex, startIndex + part.size * 2));

            value[part.name] = data;

            startIndex += part.size * 2;
        }

        return value;
    }
}
