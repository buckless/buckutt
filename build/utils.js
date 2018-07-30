'use strict'

const path = require('path')
const config = require('../config')

exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: process.env.NODE_ENV === 'production',
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used
  function generateLoaders (loader, loaderOptions) {
    const loaders = [cssLoader]
    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

  return ['vue-style-loader'].concat(loaders)
  }

  const mainColor = JSON.parse(process.env.NODE_ENV === 'production'
    ? config.build.env.color
    : config.dev.env.color
  )

  const headerColor = JSON.parse(process.env.NODE_ENV === 'production'
    ? config.build.env.headerColor
    : config.dev.env.headerColor
  )

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', {
        indentedSyntax: true,
        includePaths: [ path.join(__dirname, '..', 'node_modules') ]
    }),
    scss: generateLoaders('sass', {
        includePaths: [ path.join(__dirname, '..', 'node_modules') ],
        data: "$mdc-theme-primary: " + mainColor + ";\n$header-color: " + headerColor + ";"
    }),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  const output = []
  const loaders = exports.cssLoaders(options)
  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return output
}
