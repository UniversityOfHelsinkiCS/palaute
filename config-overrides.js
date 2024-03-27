/* eslint-disable */
const webpack = require('webpack')

module.exports = function override(config) {
  config.plugins = (config.plugins || []).concat([
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
