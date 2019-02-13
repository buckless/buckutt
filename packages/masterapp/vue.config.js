const path = require('path');
const webpack = require('webpack');
const PostCompile = require('post-compile-webpack-plugin');
const shell = require('shelljs');

const target = process.env.TARGET;
const env = process.env.NODE_ENV;

module.exports = {
    outputDir: `./dist/${target}`,
    publicPath: target === 'cordova' ? '/android_asset/www/' : '/',
    css: {
        loaderOptions: {
            postcss: require('../../postcss.config')
        }
    },

    configureWebpack: config => {
        config.watch = env === 'development' && target === 'cordova';

        config.module.rules.push({
            test: /\.csv$/,
            loader: 'csv-loader',
            options: {
                dynamicTyping: true,
                header: true,
                skipEmptyLines: true
            }
        });

        config.plugins.push(
            new webpack.EnvironmentPlugin({
                TARGET: target
            })
        );

        if (target === 'cordova') {
            const command =
                env === 'development' ? 'cordova run android' : 'cordova build android --release';

            config.plugins.push(
                new PostCompile(() => {
                    if (target === 'cordova') {
                        shell.rm('-r', path.join(__dirname, 'cordova', 'www'));
                        shell.cp(
                            '-r',
                            path.join(__dirname, 'dist', target),
                            path.join(__dirname, 'cordova', 'www')
                        );
                        shell.touch(path.join(__dirname, 'cordova', 'www', '.gitkeep'));
                        shell.cd(path.join(__dirname, 'cordova'));
                        shell.exec(command);
                    }
                })
            );
        }
    }
};
