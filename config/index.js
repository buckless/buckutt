'use strict'

// see http://vuejs-templates.github.io/webpack for documentation.
const path = require('path')

module.exports = {
  build: {
    env: require('./profiles/production'),
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    productionSourceMap: true,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  },
  dev: {
    env: require('./profiles/development'),
    port: 8083,
    autoOpenBrowser: true,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: process.env.DEV_PROXY ? {
      '/api/login': {
        target      : 'http://0.0.0.0:3000/services/',
        changeOrigin: true,
        pathRewrite : { '/api': '' },
        headers     : { 'X-fingerprint': 'manager' }
      },
      '/api/callback': {
        target      : 'http://0.0.0.0:3000/provider/callback',
        changeOrigin: true,
        pathRewrite : { '/api/callback': '' },
        headers     : { 'X-fingerprint': 'manager' }
      },
      '/api/**': {
        target      : 'http://0.0.0.0:3000/services/manager/',
        changeOrigin: true,
        pathRewrite : { '/api': '' },
        headers     : { 'X-fingerprint': 'manager' }
      },
      '/socket.io': {
        target      : 'http://0.0.0.0:3000/',
        changeOrigin: true,
        ws          : true,
        headers     : { 'X-fingerprint': 'manager' }
      }
    } : {},
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false
  }
}
