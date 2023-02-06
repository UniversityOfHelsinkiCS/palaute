/* eslint-disable prefer-destructuring */
/**
 * Insert application wide common items here
 */

const inProduction = process.env.NODE_ENV === 'production'

const inStaging = process.env.REACT_APP_STAGING === 'true'

const inE2EMode = process.env.REACT_APP_E2E === 'true'

const ADMINS = ['kalleilv', 'mluukkai', 'ttiittan', 'kurhila', 'vesuvesu', 'kemiko']

const WORKLOAD_QUESTION_ID = 1042

const basePath = process.env.PUBLIC_URL || ''

const GIT_SHA = process.env.REACT_APP_GIT_SHA || ''

const NOAD_LINK_EXPIRATION_DAYS = 14

module.exports = {
  inProduction,
  inE2EMode,
  inStaging,
  basePath,
  GIT_SHA,
  ADMINS,
  NOAD_LINK_EXPIRATION_DAYS,
  WORKLOAD_QUESTION_ID,
}
