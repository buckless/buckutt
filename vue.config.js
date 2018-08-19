const path = require('path');

const theme = {
    theme: process.env.VUE_APP_COLORS_THEME || '#1abc9c',
    foregroundTheme: process.env.VUE_APP_COLORS_FOREGROUND_THEME || 'rgba(0,0,0,.9)',
    background: process.env.VUE_APP_COLORS_BACKGROUND || '#fafafa',
    cardBackground: process.env.VUE_APP_COLORS_CARD_BACKGROUND || '#fff',
    foreground: process.env.VUE_APP_COLORS_FOREGROUND || 'rgba(0,0,0,.9)'
};

const sassTheme = Object.keys(theme)
    .map(name => `$${name}: ${theme[name]};`)
    .join('\n');

module.exports = {
    css: {
        loaderOptions: {
            sass: {
                includePaths: [path.resolve(__dirname, 'node_modules')],
                data: sassTheme
            }
        }
    },

    devServer: {
        port: 8083,

        disableHostCheck: true,

        proxy: process.env.DEV_PROXY
            ? {
                  '/api/login': {
                      target: 'http://0.0.0.0:3000/services/',
                      changeOrigin: true,
                      pathRewrite: { '/api': '' },
                      headers: { 'X-Fingerprint': 'manager' }
                  },
                  '/api/callback': {
                      target: 'http://0.0.0.0:3000/provider/callback',
                      changeOrigin: true,
                      pathRewrite: { '/api/callback': '' },
                      headers: { 'X-Fingerprint': 'manager' }
                  },
                  '/api': {
                      target: 'http://0.0.0.0:3000/services/manager/',
                      changeOrigin: true,
                      pathRewrite: { '/api': '' },
                      headers: { 'X-Fingerprint': 'manager' }
                  },
                  '/live': {
                      logLevel: 'debug',
                      target: 'http://0.0.0.0:3000/',
                      changeOrigin: true,
                      headers: { 'X-Fingerprint': 'manager' }
                  }
              }
            : undefined
    },

    lintOnSave: false,

    pwa: {
        name: 'Cashless',
        themeColor: '#1ABC9C',
        msTileColor: '#1ABC9C'
    }
};

console.log(path.resolve(__dirname, 'node_modules'));
