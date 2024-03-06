const { Organisation } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')

const getAdminAccess = async (user, code) => {
  const organisation = await Organisation.findOne({ where: { code } })
  return {
    organisation,
    hasReadAccess: true,
    hasWriteAccess: true,
    hasAdminAccess: true,
  }
}

const getAccessAndOrganisation = async (user, code, requiredAccess) => {
  if (user.isAdmin) {
    return getAdminAccess(user, code)
  }

  const organisationAccess = await user.getOrganisationAccess()

  const { access, organisation } = organisationAccess.find(({ organisation }) => organisation.code === code) ?? {}

  const hasReadAccess = Boolean(access?.read)
  const hasWriteAccess = Boolean(access?.write)
  const hasAdminAccess = Boolean(access?.admin)

  const missingRights = []
  if (requiredAccess?.read && !hasReadAccess) missingRights.push('read')
  if (requiredAccess?.write && !hasWriteAccess) missingRights.push('write')
  if (requiredAccess?.admin && !hasAdminAccess) missingRights.push('admin')

  if (missingRights.length > 0) {
    throw new ApplicationError(`User is missing rights for organisation ${code}: ${missingRights.join(', ')}`)
  }

  return {
    organisation,
    hasReadAccess,
    hasWriteAccess,
    hasAdminAccess,
  }
}

module.exports = {
  getAccessAndOrganisation,
}
