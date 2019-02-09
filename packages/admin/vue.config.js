const webpack = require('webpack');

module.exports = {
    lintOnSave: false,
    devServer: {
        port: 8082,
        disableHostCheck: true
    },
    configureWebpack: {
        plugins: [
            new webpack.ProvidePlugin({
                moment: 'moment'
            }),
            // Ignore all locale files of moment.js
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            new webpack.DefinePlugin({
                config: require('./config')
            })
        ]
    }
};
