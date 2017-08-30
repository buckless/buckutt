const path = require('path');
const config = require('../../config');

/* istanbul ignore next */
const relativePath = (config.imagePath) ? config.imagePath : 'images/';

module.exports = path.join(__dirname, '..', '..', relativePath);
