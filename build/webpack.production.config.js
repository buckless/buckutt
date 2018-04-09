const webpack           = require('webpack');
const merge             = require('webpack-merge');
const utils             = require('./utils');
const base              = require('./webpack.base.config');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Visualizer        = require('webpack-visualizer-plugin');

module.exports = merge(base, {
    output: {
        path: utils.resolve('./dist'),
        filename: 'app.js',
        publicPath: './'
    },
    module: {
        rules: utils.styleLoaders()
    },
    devtool: false,
    plugins: [
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new webpack.DefinePlugin({
            'process.env': { NODE_ENV: '"production"' },
            'config': require('../config')
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new OptimizeCSSPlugin(),
        new HtmlWebpackPlugin({
            filename: utils.resolve('dist/index.html'),
            template: utils.resolve('index.prod.html'),
            inject  : true,
            minify  : {
                removeComments       : true,
                collapseWhitespace   : true,
                removeAttributeQuotes: true
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            sourceMap: true
        }),
        new Visualizer()
    ]
});
