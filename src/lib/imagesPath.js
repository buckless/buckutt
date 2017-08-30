const path = require('path');
const config = require('../../config');

const relativePath = (config.imagePath) ? config.imagePath : 'images/';

module.exports = path.join(__dirname, '..', '..', relativePath);
