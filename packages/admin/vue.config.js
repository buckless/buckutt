const webpack = require('webpack');

module.exports = {
    lintOnSave: false,
    devServer: {
        port: 8082,
        disableHostCheck: true
    },
    css: {
        loaderOptions: {
            postcss: require('../../postcss.config')
        }
    },
    chainWebpack: config => {
        config.module
            .rule('js')
            .use('babel-loader')
            .loader('babel-loader')
            .tap((options = {}) => {
                options.rootMode = 'upward'
                return options
            })
    },
    configureWebpack: {
        plugins: [
            new webpack.ProvidePlugin({
                moment: 'moment'
            }),
            // Ignore all locale files of moment.js
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
        ]
    }
};
