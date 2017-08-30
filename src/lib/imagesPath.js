const path = require('path');
const config = require('../../config');

const relativePath = (config.app.imagePath) ? config.app.imagePath : 'images/';

module.exports = path.join(__dirname, '..', '..', relativePath);
