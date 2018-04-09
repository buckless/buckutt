// copied from here https://github.com/WebDevTmas/moment-round/blob/1d20ce5d338529c76da8439fe594cc6984505810/src/moment-round.js and modified
import moment from 'moment';

moment.fn.round = function(precision, key, direction = 'round') {
    const keys = ['Hours', 'Minutes', 'Seconds', 'Milliseconds'];
    const maxValues = [24, 60, 60, 1000];

    // Capitalize first letter
    key = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();

    // make sure key is plural
    if (key.indexOf('s', key.length - 1) === -1) {
        key += 's';
    }

    let value = 0;
    let rounded = false;
    let subRatio = 1;
    let maxValue;

    for (let i = 0; i < keys.length; ++i) {
        const k = keys[i];

        if (k === key) {
            value = this._d[`get${key}`]();
            maxValue = maxValues[i];
            rounded = true;
        } else if (rounded) {
            subRatio *= maxValues[i];
            value += this._d[`get${k}`]() / subRatio;
            this._d[`set${k}`](0);
        }
    }

    value = Math[direction](value / precision) * precision;
    value = Math.min(value, maxValue);
    this._d[`set${key}`](value);

    return this;
};

moment.fn.ceil = function(precision, key) {
    return this.round(precision, key, 'ceil');
};

moment.fn.floor = function(precision, key) {
    return this.round(precision, key, 'floor');
};
