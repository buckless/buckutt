const path = require('path');
const fs = require('fs');
const express = require('express');

const router = new express.Router('/');

fs.readdirSync(path.join(__dirname))
    .filter(f => f.slice(-3) === '.js' && f.slice(0, -3) !== 'index')
    .forEach(f => router.use(require(path.join(__dirname, f))));

module.exports = router;
