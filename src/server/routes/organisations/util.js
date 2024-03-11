const { ApplicationError } = require('../../util/customErrors')

const getAccessAndOrganisation = async (user, code, requiredAccess) => {
  const organisationAccess = await user.getOrganisationAccess()

  const { access, organisation } = organisationAccess.find(({ organisation }) => organisation.code === code) ?? {}

  const hasReadAccess = user.isAdmin || Boolean(access?.read)
  const hasWriteAccess = user.isAdmin || Boolean(access?.write)
  const hasAdminAccess = user.isAdmin || Boolean(access?.admin)

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
