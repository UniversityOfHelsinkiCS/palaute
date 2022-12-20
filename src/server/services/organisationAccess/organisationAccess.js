const _ = require('lodash')
const Sentry = require('@sentry/node')

const { normalizeOrganisationCode } = require('../../../config/common')
const { relevantOrganisations } = require('../../../config/IAMConfig')
const Organisation = require('../../models/organisation')
const { ADMINS, inE2EMode } = require('../../util/config')
const jamiClient = require('../../util/jamiClient')
const logger = require('../../util/logger')

const isSuperAdmin = (user) => ADMINS.includes(user.username)

const organisationIsRelevant = (organisation) => {
  const { code } = organisation

  const isRelevant = relevantOrganisations.includes(code)

  return isRelevant
}

const getAccessToAll = async (accessLevel) => {
  const access = {}
  const allOrganisations = await Organisation.findAll({ attributes: ['code'] })
  allOrganisations.filter(organisationIsRelevant).forEach(({ code }) => {
    access[code] = accessLevel
  })
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
    return getAccessToAll({ read: true, write: true, admin: true })
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
