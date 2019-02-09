const fs      = require('fs');
const memoize = require('lodash.memoize');

const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const base64headerRegex = /^data:image\/(\w+);base64,/;

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
                return reject(err);
            }

            /* istanbul ignore else */
            if (stats.isFile()) {
                return resolve(true);
            }
        });
    });
}

/**
 * Converts a base64 image to a buffer
 * Returns false if no header is matched
 * @param  {String} image base64 image
 * @return {Object|false} result containing image buffer and format
 */
function base64ImageToBuffer(image) {
    // we're going to test on sliced image to avoid regex on a bytes of data
    const match = image.slice(0, 25).match(base64headerRegex);

    if (!match) {
        return false;
    }
    const headerLength = match[0].length;

    return {
        buffer: Buffer.from(image.slice(headerLength), 'base64'),
        format: match[1]
    };
}

/**
 * Validates a guid string
 * @param  {String} str Input string
 * @return {Boolean} True if string is guid
 */
const isGuid = memoize(str => guidRegex.test(str));

module.exports = { pad2, isGuid, fileExists, base64ImageToBuffer };
