/**
 * Insert application wide common items here
 */

const inProduction = process.env.NODE_ENV === 'production'

const basePath = process.env.PUBLIC_URL || ''

const GIT_SHA = process.env.GIT_SHA || ''

module.exports = {
  inProduction,
  basePath,
  GIT_SHA,
}
