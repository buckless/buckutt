const mainConfig = require('../../prettier.config');

module.exports = {
    ...mainConfig,
    // specify single quote to disable errors for this file
    singleQuote: true,
    overrides: [
        {
            files: '.prettierrc',
            options: { parser: 'json' }
        }
    ]
};
