const fs      = require('fs');
const memoize = require('lodash.memoize');

const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Pads a string if inferior to 10
 * @param  {String|Number} n The numeric value
 * @return {String} The padded number
 */
function pad2(n) {
    const str = String(n);

    return (str.length === 1) ? `0${str}` : str;
}

/**
 * Checks if a file exists
 * @param  {String} path Given path
 * @return {Promise<Boolean>} True if file exists
 */
function fileExists(path) {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    return resolve(false);
                }

                return reject(err);
            }

            if (stats.isFile()) {
                return resolve(true);
            }
        });
    });
}

/**
 * Validates a guid string
 * @param  {String} str Input string
 * @return {Boolean} True if string is guid
 */
function isGuid(str) {
    return guidRegex.test(str);
}

isGuid = memoize(isGuid);

module.exports = { pad2, isGuid, fileExists };
