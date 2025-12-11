import { OrganisationAccess } from '@common/types/organisation'
import { getUserOrganisationAccess } from '../../services/organisationAccess/organisationAccess'
import { Organisation, User } from '../../models'
import { ApplicationError } from '../../util/ApplicationError'

export const getAccessAndOrganisation = async (user: User, code: string, requiredAccess?: OrganisationAccess) => {
  const organisationAccess = await getUserOrganisationAccess(user)

  const { access } = organisationAccess.find(({ organisation }) => organisation.code === code) ?? {}

  const organisation = await Organisation.findOne({ where: { code } })

  const hasReadAccess = user.isAdmin || Boolean(access?.read)
  const hasWriteAccess = user.isAdmin || Boolean(access?.write)
  const hasAdminAccess = user.isAdmin || Boolean(access?.admin)

  const missingRights: ('read' | 'write' | 'admin')[] = []
  if (requiredAccess?.read && !hasReadAccess) missingRights.push('read')
  if (requiredAccess?.write && !hasWriteAccess) missingRights.push('write')
  if (requiredAccess?.admin && !hasAdminAccess) missingRights.push('admin')

  if (missingRights.length > 0) {
    throw new ApplicationError(`User is missing rights for organisation ${code}: ${missingRights.join(', ')}`, 403)
  }

  return {
    organisation,
    hasReadAccess,
    hasWriteAccess,
    hasAdminAccess,
  }
}
