/**
 * Insert application wide common items here
 */

const inProduction = process.env.NODE_ENV === 'production'

const inE2EMode = process.env.REACT_APP_E2E === 'true'

const runningJest = process.env.REACT_APP_JEST === 'true'

const ADMINS = [
  'varisleo',
  'kalleilv',
  'jakousa',
  'mluukkai',
  'keolli',
  'ttiittan',
  'kurhila',
]

const basePath = process.env.PUBLIC_URL || ''

const GIT_SHA = process.env.REACT_APP_GIT_SHA || ''

module.exports = {
  inProduction,
  inE2EMode,
  runningJest,
  basePath,
  GIT_SHA,
  ADMINS,
}
