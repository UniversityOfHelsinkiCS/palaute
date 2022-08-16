const _ = require('lodash')
const Organisation = require('../models/organisation')
const { ADMINS } = require('./config')
const { getIAMRights } = require('./IAMrights')
const { normalizeOrganisationCode } = require('../../config/common')

const RELEVANT_ORGANISATION_CODES = [
  'H906', // Kielikeskus
  'H930', // Avoin yliopisto
]

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

  return code.includes('-') || RELEVANT_ORGANISATION_CODES.includes(code)
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
  const organisations = await Organisation.findAll({
    attributes: ['code'],
    where: {
      responsibleUserId: user.id,
    },
  })
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
