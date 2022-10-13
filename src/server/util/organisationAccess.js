const _ = require('lodash')
const { normalizeOrganisationCode } = require('../../config/common')
const { relevantOrganisations } = require('../../config/IAMConfig')
const Organisation = require('../models/organisation')
const { ADMINS } = require('./config')
const { getIAMRights } = require('./IAMrights')

const ORGANISATION_ACCESS_BY_IAM_GROUP = {
  'grp-kielikeskus-esihenkilot': {
    // Kielikeskus
    H906: {
      read: true,
      write: true,
      admin: true,
    },
  },
  'grp-avoin-johto': {
    // Avoin yliopisto
    H930: {
      read: true,
    },
  },
}

const getOrganisationAccessFromIamGroups = (user) => {
  const access = {}

  const iamAccess = (user.iamGroups ?? []).reduce(
    (access, group) =>
      _.merge(access, ORGANISATION_ACCESS_BY_IAM_GROUP[group] ?? {}),
    {},
  )

  Object.keys(iamAccess).forEach((code) => {
    access[normalizeOrganisationCode(code)] = iamAccess[code]
  })

  return access
}

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

const getLomakeAccess = async (user) => {
  const access = {}
  const { access: iamAccess } = getIAMRights(user.iamGroups)

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
    ...(await getLomakeAccess(user)),
    ...(await getFeedbackCorrespondentAccess(user)),
    ...getOrganisationAccessFromIamGroups(user),
  }

  return access
}

module.exports = {
  getOrganisationAccess,
}
