const path = require('path');

module.exports = {
    plugins: [
        require('postcss-import'),
        require('postcss-mixins'),
        require('postcss-custom-properties'),
        require('postcss-simple-vars'),
        require('postcss-calc'),
        require('postcss-color-mod-function')({
            importFrom: path.resolve(__dirname, './packages/ui/src/theme.css')
        }),
        require('postcss-custom-media'),
        require('postcss-nested'),
        require('postcss-url'),
        require('autoprefixer')
    ]
};
