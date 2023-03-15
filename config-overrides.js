/* eslint-disable */
const webpack = require('webpack')

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {}
  Object.assign(fallback, {
    path: require.resolve('path-browserify'),
    fs: require.resolve('browserify-fs'),
    os: require.resolve('os-browserify/browser'),
    stream: require.resolve('stream-browserify'),
    util: require.resolve('util/'),
  })
  config.resolve.fallback = fallback
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      CONFIG: (() => {
        const config = require('config')
        const configObj = config.util.toObject()
        for (const key of config.get('PRIVATE_KEYS')) {
          delete configObj[key]
        }
        return JSON.stringify(configObj)
      })(),
    }),
  ])
  config.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false,
    },
  })
  return config
}
