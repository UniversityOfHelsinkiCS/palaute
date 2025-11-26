const { Op, QueryTypes } = require('sequelize')
const _ = require('lodash')

const { User, Organisation } = require('../../models')

const { normalizeOrganisationCode } = require('../../util/common')
const { getAllUserAccess, getAccessToAll, getUserIamAccess } = require('../../util/jami')
const { inProduction, DEV_ADMINS } = require('../../util/config')
const { sequelize } = require('../../db/dbConnection')

const getAdminOrganisationAccess = () => getAccessToAll()

const getAllOrganisationAccess = async () => {
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

    const normalizedAccess = {}
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

    const sortedOrganisationAccess = _.sortBy(organisationAccess, access => access.organisation.code)

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

const getAccessFromIAMs = async user => {
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

const populateUserAccess = async user => {
  if (user.organisationAccess) return

  // get organisation access and special groups based on IAMs
  const organisationAccess = {
    ...(await getAccessFromIAMs(user)),
    ...(await getFeedbackCorrespondentAccess(user)),
  }

  this.organisationAccess = organisationAccess
  this.specialGroup = organisationAccess.specialGroup ?? {}
  this.isAdmin = user.specialGroup.superAdmin
  this.isEmployee = user.specialGroup.employee

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

const getUserOrganisationAccess = async user => {
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

const getOrganisationAccessByCourseUnitId = async (user, courseUnitId) => {
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

  function getPriority(org) {
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
  const organisationAccess = organisations
    .filter(({ organisation }) => organisationIds.includes(organisation.id))
    ?.sort((a, b) => getPriority(a) - getPriority(b)) // read, write, admin. Reduce on next line practically takes the last value
    .reduce((finalAccess, org) => ({ ...finalAccess, ...org.access }), {})

  return organisationAccess ?? null
}

module.exports = {
  populateUserAccess,
  getUserOrganisationAccess,
  getOrganisationAccessByCourseUnitId,
  getAdminOrganisationAccess,
  getAllOrganisationAccess,
}
