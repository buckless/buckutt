const url = require('url')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const prepareURLs = require('@vue/cli-service/lib/util/prepareURLs')
const validateWebpackConfig = require('@vue/cli-service/lib/util/validateWebpackConfig')

module.exports = (api, options) => {
    api.chainWebpack(config => {
        // make babel use babel.config.js
        config.module
            .rule('js')
            .use('babel-loader')
            .loader('babel-loader')
            .tap((options = {}) => {
                options.rootMode = 'upward';
                return options;
            });

        // remove console-cleaning plugins
        config.plugins.delete('friendly-errors')
        config.plugins.delete('progress')
    });

    // Heavily inspired from @vue/cli-service
    api.registerCommand('calm-serve', {
        description: 'start development server without terminal cleaning',
        usage: 'vue-cli-service calm:serve'
    }, async function serve() {
        // resolve webpack config
        const webpackConfig = api.resolveWebpackConfig()

        // check for common config errors
        validateWebpackConfig(webpackConfig, api, options)

            const projectDevServerOptions = Object.assign(
                webpackConfig.devServer || {},
                options.devServer
            );

        const urls = prepareURLs('http', '0.0.0.0', projectDevServerOptions.port)

        const sockjsUrl = '?' + url.format({
            protocol: 'http',
            port: projectDevServerOptions.port,
            hostname: urls.lanUrlForConfig || 'localhost',
            pathname: '/sockjs-node'
        });

        const devClients = [
            require.resolve(`webpack-dev-server/client`) + sockjsUrl,
            require.resolve('webpack/hot/dev-server')
        ]

        addDevClientToEntry(webpackConfig, devClients)

        const compiler = webpack(webpackConfig)

        const server = new WebpackDevServer(compiler, Object.assign({
            contentBase: api.resolve('public'),
            watchContentBase: true,
            hot: true,
            quiet: true,
            compress: false,
            publicPath: options.publicPath,
            overlay: true
        }, projectDevServerOptions, {
            before(app, server) {
                // allow other plugins to register middlewares, e.g. PWA
                api.service.devServerConfigFns.forEach(fn => fn(app, server))
                // apply in project middlewares
                projectDevServerOptions.before && projectDevServerOptions.before(app, server)
            }
        }));

        ['SIGINT', 'SIGTERM'].forEach(signal => {
            process.on(signal, () => {
                server.close(() => {
                    process.exit(0)
                })
            })
        });

        console.log(`${api.service.pkg.name} - start`);

        compiler.hooks.done.tap('vue-cli-service calm-serve', stats => {
            if (stats.hasErrors()) {
                console.error(`${api.service.pkg.name} - failed`);
                console.error(stats.toString('errors-only'));
            } else {
                console.log(`${api.service.pkg.name} - build`);
            }
        });

        compiler.hooks.compile.tap('vue-cli-service calm-serve', () => {
            console.log(`${api.service.pkg.name} - start`);
        });

        server.listen(projectDevServerOptions.port, '0.0.0.0', err => {
            if (err) {
                throw err;
            }
        });
    });
}

function addDevClientToEntry(config, devClient) {
    const { entry } = config
    if (typeof entry === 'object' && !Array.isArray(entry)) {
        Object.keys(entry).forEach((key) => {
            entry[key] = devClient.concat(entry[key])
        })
    } else if (typeof entry === 'function') {
        config.entry = entry(devClient)
    } else {
        config.entry = devClient.concat(entry)
    }
}

module.exports.defaultModes = {
    serve: 'development'
}
