const path = require('path');
const crypto = require('crypto');
const { colors } = require('config/manager');

const theme = {
    theme: colors.theme || '#1abc9c',
    foregroundTheme: colors.foregroundTheme || 'rgba(0,0,0,.9)',
    background: colors.background || '#fafafa',
    cardBackground: colors.cardBackground || '#fff',
    foreground: colors.foreground || 'rgba(0,0,0,.9)'
};

const sassTheme = Object.keys(theme)
    .map(name => `$${name}: ${theme[name]};`)
    .join('\n');

const generateSignature = (method, url) => {
    const signPath = url.replace('/api/v1', '');
    const signaturePayload = `manager-${method}-/${signPath}`;
    const hmac = crypto.createHmac('sha256', 'manager').update(signaturePayload);
    return hmac.digest('hex');
};

module.exports = {
    css: {
        loaderOptions: {
            sass: {
                includePaths: [
                    path.resolve(__dirname, 'node_modules'),
                    path.resolve(__dirname, '../../node_modules')
                ],
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
                      target: 'http://0.0.0.0:3000/api/v1/auth/login',
                      changeOrigin: true,
                      pathRewrite: { '/api/login': '' },
                      headers: { 'X-Fingerprint': 'manager' },
                      onProxyReq: proxyReq => {
                          proxyReq.setHeader(
                              'x-Signature',
                              generateSignature(proxyReq.method, proxyReq.path)
                          );
                      }
                  },
                  '/api/callback': {
                      target: 'http://0.0.0.0:3000/api/v1/provider/callback',
                      changeOrigin: true,
                      pathRewrite: { '/api/callback': '' },
                      headers: { 'X-Fingerprint': 'manager' },
                      onProxyReq: proxyReq => {
                          proxyReq.setHeader(
                              'x-Signature',
                              generateSignature(proxyReq.method, proxyReq.path)
                          );
                      }
                  },
                  '/api': {
                      target: 'http://0.0.0.0:3000/api/v1/manager/',
                      changeOrigin: true,
                      pathRewrite: { '/api': '' },
                      headers: { 'X-Fingerprint': 'manager' },
                      onProxyReq: proxyReq => {
                          proxyReq.setHeader(
                              'x-Signature',
                              generateSignature(proxyReq.method, proxyReq.path)
                          );
                      }
                  },
                  '/live': {
                      target: 'http://0.0.0.0:3000/api/v1/live',
                      changeOrigin: true,
                      pathRewrite: { '/live': '' },
                      headers: { 'X-Fingerprint': 'manager' },
                      onProxyReq: proxyReq => {
                          proxyReq.setHeader(
                              'x-Signature',
                              generateSignature(proxyReq.method, proxyReq.path)
                          );
                      }
                  }
              }
            : undefined
    },

    lintOnSave: false,

    pwa: {
        name: 'Cashless',
        themeColor: '#1ABC9C',
        msTileColor: '#1ABC9C'
    },

    pluginOptions: {
        i18n: {
            locale: 'fr',
            fallbackLocale: 'fr',
            localeDir: 'locales',
            enableInSFC: false
        }
    }
};
