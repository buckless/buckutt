const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v4');

/**
 * You first need to create a formatting function to pad numbers to two digits…
 **/
function twoDigits(d) {
    if (0 <= d && d < 10) return "0" + d.toString();
    if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
    return d.toString();
}

/**
 * …and then create the method to output the date string as desired.
 * Some people hate using prototypes this way, but if you are going
 * to apply this to more than one Date object, having it as a prototype
 * makes sense.
 **/
Date.prototype.toMysqlFormat = function () {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};

const table = fs.readFileSync(path.join(__dirname, 'physicalSupports.csv'), 'utf8');
let output = '';

const re = /^(\w+),(\w+).+/;
const now = new Date().toMysqlFormat();

for (let line of table.split('\n')) {
    const sub = `INSERT INTO physicalsupports (id, physical_id, logical_id, created_at, updated_at, deleted_at, active) VALUES ('${uuid()}', '$1', '$2', '${now}', '${now}', NULL, '1');\n`;
    const newLine = line.replace(re, sub);
    output += newLine;
}

fs.writeFileSync('physicalSupports.sql', output);
