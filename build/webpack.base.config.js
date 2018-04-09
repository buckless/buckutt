const path    = require('path');
const webpack = require('webpack');
const utils   = require('./utils');
const appConfig = require('../config');

module.exports = {
    entry: utils.resolve('./src/main.js'),
    output: {
        path: utils.resolve('./dist'),
        filename: 'app.js',
        publicPath: './'
    },
    target: 'web',
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            '@': utils.resolve('src'),
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: utils.cssLoaders({ extract: utils.IS_PROD })
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [ utils.resolve('src') ]
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'file-loader',
                query: {
                    name: '[name].[ext]',
                    publicPath: '/'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'file-loader',
                query: {
                    name: '[name].[ext]',
                    publicPath: '/'
                }
            }
        ]
    },
    performance: {
        hints: false
    },
    devServer: {
        disableHostCheck: true,
        historyApiFallback: true,
        hot: true,
        port: 8082,
        publicPath: '/',
        public: appConfig.url ? JSON.parse(appConfig.url) : ''
    },
    devtool: '#eval-source-map',
    plugins: [
        new webpack.ProvidePlugin({
            moment: 'moment'
        })
    ]
}
