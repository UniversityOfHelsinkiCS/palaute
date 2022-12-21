const _ = require('lodash')
const Sentry = require('@sentry/node')

const { normalizeOrganisationCode } = require('../../util/common')
const { ADMINS, inE2EMode } = require('../../util/config')
const jamiClient = require('../../util/jamiClient')
const logger = require('../../util/logger')

const isSuperAdmin = (user) => ADMINS.includes(user.username)

const getAccessToAll = async () => {
  const { data: access } = await jamiClient.get('/access-to-all')

  return access
}

const getIAMAccessFromJami = async (user, attempt = 1) => {
  if (user.iamGroups.length === 0) return {}

  const { userId, iamGroups } = user

  try {
    const { data: iamAccess } = await jamiClient.post('/', {
      userId,
      iamGroups,
    })

    return iamAccess
  } catch (error) {
    if (attempt > 3) {
      logger.error(error)
      Sentry.captureException(error)

      return {}
    }

    return getIAMAccessFromJami(user, attempt + 1)
  }
}

const getAccessFromIAMs = async (user) => {
  if (inE2EMode) return {}

  const access = {}

  const iamAccess = await getIAMAccessFromJami(user)

  if (!_.isObject(iamAccess)) return access
  Object.keys(iamAccess).forEach((code) => {
    access[normalizeOrganisationCode(code)] = iamAccess[code]
  })
  return access
}

const getFeedbackCorrespondentAccess = async (user) => {
  const organisations = await user.getOrganisations()

  if (organisations?.length > 0) {
    const access = {}
    organisations.forEach((org) => {
      access[org.code] = { read: true, write: true, admin: true }
    })
    return access
  }

  return {}
}

const getOrganisationAccess = async (user) => {
  if (isSuperAdmin(user)) {
    return getAccessToAll()
  }

  const access = {
    ...(await getAccessFromIAMs(user)),
    ...(await getFeedbackCorrespondentAccess(user)),
  }

  return access
}

module.exports = {
  getOrganisationAccess,
}
