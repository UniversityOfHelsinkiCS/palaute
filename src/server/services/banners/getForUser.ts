import { Op } from 'sequelize'
import { Banner, User } from '../../models'
import { getUserOrganisationAccess } from '../organisationAccess/organisationAccess'

export const getBannersForUser = async (user: User): Promise<Banner[]> => {
  let access: string[] = ['STUDENT']

  const isTeacher = await user.isTeacher()
  const hasOrgAccess = (await getUserOrganisationAccess(user))?.length > 0

  if (user.isAdmin) {
    access = access.concat(['TEACHER', 'ORG', 'ADMIN'])
  } else if (hasOrgAccess) {
    access = access.concat(['TEACHER', 'ORG'])
  } else if (isTeacher) {
    access = access.concat(['TEACHER'])
  }

  const banners = await Banner.findAll({
    where: {
      accessGroup: {
        [Op.in]: access,
      },
      endDate: {
        [Op.gt]: new Date(),
      },
    },
  })

  return banners
}
