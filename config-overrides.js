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
    new webpack.DefinePlugin({ CONFIG: JSON.stringify(require('config')) }),
  ])
  config.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false,
    },
  })
  return config
}
