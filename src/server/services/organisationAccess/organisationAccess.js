const _ = require('lodash')

const { normalizeOrganisationCode } = require('../../util/common')
const { ADMINS, inE2EMode } = require('../../util/config')
const { getUserIamAccess, getAccessToAll } = require('../../util/jami')

const isSuperAdmin = user => ADMINS.includes(user.username)

const getAccessFromIAMs = async user => {
  if (inE2EMode) return {}

  const access = {}

  const iamAccess = await getUserIamAccess(user)

  if (!_.isObject(iamAccess)) return access
  Object.keys(iamAccess).forEach(code => {
    access[normalizeOrganisationCode(code)] = iamAccess[code]
  })
  return access
}

const getFeedbackCorrespondentAccess = async user => {
  const organisations = await user.getOrganisations()

  if (organisations?.length > 0) {
    const access = {}
    organisations.forEach(org => {
      access[org.code] = { read: true, write: true, admin: true }
    })
    return access
  }

  return {}
}

const getOrganisationAccess = async user => {
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
