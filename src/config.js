/**
 * Insert application wide common items here
 */

const inProduction = process.env.NODE_ENV === 'production'

const ADMINS = ['varisleo', 'kalleilv', 'jakousa', 'mluukkai', 'ttiittan']

const basePath = process.env.PUBLIC_URL || ''

const GIT_SHA = process.env.REACT_APP_GIT_SHA || ''

module.exports = {
  inProduction,
  basePath,
  GIT_SHA,
  ADMINS,
}
