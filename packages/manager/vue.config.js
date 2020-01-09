module.exports = {
    devServer: {
        port: 8083,
        disableHostCheck: true
    },
    css: {
        loaderOptions: {
            postcss: require('./postcss.config')
        }
    },
    chainWebpack: config => {
        config.plugins.delete('progress');
    }
};
