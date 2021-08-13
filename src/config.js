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

// These courses bypass the starting after 1.9 filter
const INCLUDE_COURSES = ['hy-opt-cur-2122-329bfeb5-2c56-450f-b3f5-ff9dbcca8932']

const basePath = process.env.PUBLIC_URL || ''

const GIT_SHA = process.env.REACT_APP_GIT_SHA || ''

module.exports = {
  inProduction,
  inE2EMode,
  runningJest,
  basePath,
  GIT_SHA,
  ADMINS,
  INCLUDE_COURSES,
}
