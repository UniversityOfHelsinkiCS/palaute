/**
 * Insert application wide common items here
 */

const inProduction = process.env.NODE_ENV === 'production'

const basePath = process.env.PUBLIC_URL || ''

module.exports = {
  inProduction,
  basePath,
}
