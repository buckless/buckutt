const path = require("path");
const webpack = require("webpack");
const PostCompile = require("post-compile-webpack-plugin");
const shell = require("shelljs");
const chalk = require("chalk");

const target = process.env.TARGET;
const platform = process.env.PLATFORM;
const env = process.env.NODE_ENV;

let publicPath = "";
if (target === "cordova" && platform === "android") {
    publicPath = "/android_asset/www/";
} else if (target === "electron") {
    publicPath = path.resolve(__dirname, "dist", "electron") + "/";
} else if (target === "browser") {
    publicPath = "/";
}

let electronLaunched = false;

module.exports = {
    lintOnSave: false,
    outputDir: `./dist/${target}`,
    baseUrl: publicPath,

    configureWebpack: config => {
        if (target === "browser" || target === "cordova") {
            config.target = "web";
        } else if (target === "electron") {
            config.plugins.push(
                new webpack.ExternalsPlugin("commonjs", ["@pokusew/pcsclite"])
            );
            config.node = { __dirname: false };
        } else {
            console.log(chalk.yellow("Unknown target: " + target));
        }

        config.entry.app = "./src/app/index.js";
        config.resolve.alias["@"] = path.join(__dirname, "src", "app");

        config.watch =
            env === "development" &&
            (target === "cordova" || target === "browser");

        config.module.rules.push({
            test: /\.csv$/,
            loader: "csv-loader",
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

        config.plugins.push(
            new webpack.DefinePlugin({
                config: require("./config")
            })
        );

        config.plugins.push(
            new PostCompile(() => {
                if (target === "cordova") {
                    shell.rm("-r", path.join(__dirname, "cordova", "www"));
                    shell.cp(
                        "-r",
                        path.join(__dirname, "dist", target),
                        path.join(__dirname, "cordova", "www")
                    );
                    shell.touch(
                        path.join(__dirname, "cordova", "www", ".gitkeep")
                    );
                    shell.cd(path.join(__dirname, "cordova"));
                    shell.exec(
                        env === "development"
                            ? "cordova run android"
                            : "cordova build android --release"
                    );
                }

                if (target === "electron" && !electronLaunched) {
                    electronLaunched = true;
                    shell.exec("electron " + path.resolve(__dirname), {
                        async: true,
                        silent: true
                    });
                }
            })
        );
    }
};
