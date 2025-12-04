import { Op, QueryTypes } from 'sequelize'
import _ from 'lodash'

import { OrganisationAccess } from '@common/types/organisation'
import { User, Organisation } from '../../models'
import { normalizeOrganisationCode } from '../../util/common'
import { getAllUserAccess, getAccessToAll, getUserIamAccess } from '../../util/jami'
import { inProduction, DEV_ADMINS } from '../../util/config'
import { sequelize } from '../../db/dbConnection'

export const getAdminOrganisationAccess = () => getAccessToAll()

export const getAllOrganisationAccess = async () => {
  const allAccess = await getAllUserAccess()

  const userIds = allAccess.map(({ id }) => id)

  const users = await User.findAll({
    where: {
      id: {
        [Op.in]: userIds,
      },
    },
  })

  const usersWithAccess = []
  for (const user of users) {
    const { iamGroups, access } = allAccess.find(({ id }) => id === user.id)

    const normalizedAccess: Record<string, OrganisationAccess> = {}
    Object.keys(access).forEach(code => {
      normalizedAccess[normalizeOrganisationCode(code)] = access[code]
    })

    const organisationCodes = Object.keys(normalizedAccess)
    const organisations = await Organisation.findAll({
      where: {
        code: {
          [Op.in]: organisationCodes,
        },
      },
    })

    const organisationAccess = organisations.map(org => ({
      access: normalizedAccess[org.code],
      organisation: org,
    }))

    const sortedOrganisationAccess = _.sortBy(organisationAccess, oa => oa.organisation.code)

    // eslint-disable-next-line no-continue
    if (!organisationAccess.length) continue

    usersWithAccess.push({
      ...user.dataValues,
      iamGroups,
      access: sortedOrganisationAccess,
    })
  }

  return usersWithAccess
}

const getAccessFromIAMs = async (user: User) => {
  const access: Record<string, OrganisationAccess> = {}

  const iamAccess = await getUserIamAccess(user)

  if (!_.isObject(iamAccess)) return access
  Object.keys(iamAccess).forEach(code => {
    access[normalizeOrganisationCode(code)] = iamAccess[code] as OrganisationAccess
  })

  return access
}

const getFeedbackCorrespondentAccess = async (user: User) => {
  const organisations = await user.getOrganisations()

  if (organisations?.length > 0) {
    const access: Record<string, OrganisationAccess> = {}
    organisations.forEach(org => {
      access[org.code] = { read: true, write: true, admin: true }
    })
    return access
  }

  return {}
}

export const populateUserAccess = async (user: User) => {
  if (user.organisationAccess) return

  // get organisation access and special groups based on IAMs
  const organisationAccess = {
    ...(await getAccessFromIAMs(user)),
    ...(await getFeedbackCorrespondentAccess(user)),
  }

  user.organisationAccess = organisationAccess
  user.specialGroup = organisationAccess.specialGroup ?? {}
  user.isAdmin = user.specialGroup.superAdmin
  user.isEmployee = user.specialGroup.employee

  // remove specialGroup from organisationAccess. Its confusing to have it there, other keys are organisation codes.
  delete user.organisationAccess.specialGroup

  // Give admin access to configured users in development
  if (!inProduction) {
    user.isAdmin = DEV_ADMINS.includes(user.username)
  }

  if (user.isAdmin) {
    user.organisationAccess = await getAdminOrganisationAccess()
  }
}

export const getUserOrganisationAccess = async (
  user: User
): Promise<{ access: OrganisationAccess; organisation: Organisation }[]> => {
  await populateUserAccess(user)
  let { accessibleOrganisations } = user

  if (!accessibleOrganisations) {
    accessibleOrganisations = await Organisation.findAll({
      attributes: ['id', 'name', 'code', 'parentId'],
      where: {
        code: {
          [Op.in]: Object.keys(user.organisationAccess),
        },
      },
      include: {
        model: User,
        as: 'users',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
    })
  }

  return accessibleOrganisations.map(org => ({
    access: user.organisationAccess[org.code],
    organisation: org,
  }))
}

export const getOrganisationAccessByCourseUnitId = async (user: User, courseUnitId: string) => {
  const organisations = await getUserOrganisationAccess(user)

  if (organisations.length === 0) {
    return null
  }

  const rows = await sequelize.query(
    `
      SELECT DISTINCT
        course_units_organisations.organisation_id AS cu_org_id,
        course_realisations_organisations.organisation_id AS cur_org_id
      FROM
        course_units
      LEFT JOIN
        course_units_organisations ON course_units_organisations.course_unit_id = course_units.id
      LEFT JOIN
        feedback_targets ON feedback_targets.course_unit_id = course_units.id
      LEFT JOIN
        course_realisations ON feedback_targets.course_realisation_id = course_realisations.id
      LEFT JOIN
        course_realisations_organisations ON course_realisations_organisations.course_realisation_id = course_realisations.id
      WHERE
        course_units.id = :courseUnitId;
      `,
    {
      type: QueryTypes.SELECT,
      replacements: {
        courseUnitId,
      },
    }
  )

  const organisationIds = rows.flatMap(row => Object.values(row))

  function getPriority(org: { access: OrganisationAccess }) {
    let weight = 0
    if (org.access.admin) {
      weight += 100
    }
    if (org.access.write) {
      weight += 10
    }
    if (org.access.read) {
      weight += 1
    }
    return weight
  }
  const organisationAccess: OrganisationAccess = organisations
    .filter(({ organisation }) => organisationIds.includes(organisation.id))
    ?.sort((a, b) => getPriority(a) - getPriority(b)) // read, write, admin. Reduce on next line practically takes the last value
    .reduce((finalAccess, org) => ({ ...finalAccess, ...org.access }), {})

  return organisationAccess ?? null
}
