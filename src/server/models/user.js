const { Model, STRING, Op, VIRTUAL, BOOLEAN } = require('sequelize')
const _ = require('lodash')

const { sequelize } = require('../util/dbConnection')
const lomakeClient = require('../util/lomakeClient')
const Organisation = require('./organisation')
const { ADMINS, inProduction } = require('../util/config')

const isNumber = (value) => !Number.isNaN(parseInt(value, 10))

const normalizeOrganisationCode = (r) => {
  if (!r.includes('_')) {
    return r
  }

  const [left, right] = r.split('_')
  const prefix = [...left].filter(isNumber).join('')
  const suffix = `${left[0]}${right}`
  const providercode = `${prefix}0-${suffix}`
  return providercode
}

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
      write: false,
      admin: false,
    },
  },
}

const isVaradekaani = (user) =>
  (user.iamGroups ?? []).includes('hy-varadekaanit-opetus')

const organisationIsRelevant = (organisation) => {
  const { code } = organisation

  return code.includes('-') || RELEVANT_ORGANISATION_CODES.includes(code)
}

const getOrganisationAccessFromLomake = async (username) => {
  const { data: access } = await lomakeClient.get(`/organizations/${username}`)

  return _.isObject(access) ? access : {}
}

const getOrganisationAccessFromIamGroups = (iamGroups) =>
  (iamGroups ?? []).reduce(
    (access, group) =>
      _.merge(access, ORGANISATION_ACCESS_BY_IAM_GROUP[group] ?? {}),
    {},
  )

const canHaveOrganisationAccess = (user) => {
  if (!inProduction) {
    return true
  }

  return Boolean(user.iamGroups?.includes('hy-employees'))
}

class User extends Model {
  async getOrganisationAccess() {
    if (ADMINS.includes(this.username)) {
      const allOrganisations = await Organisation.findAll({})
      return allOrganisations
        .filter(organisationIsRelevant)
        .map((organisation) => ({
          organisation,
          access: { read: true, write: true, admin: true },
        }))
    }

    if (!canHaveOrganisationAccess(this)) {
      return []
    }

    const lomakeAccess = await getOrganisationAccessFromLomake(this.username)
    const iamGroupAccess = getOrganisationAccessFromIamGroups(this.iamGroups)
    const access = _.merge({}, lomakeAccess, iamGroupAccess)

    const organisationCodes = Object.keys(access)

    const normalizedOrganisationCodes = organisationCodes.map(
      normalizeOrganisationCode,
    )

    const codeByNormalizedCode = _.zipObject(
      normalizedOrganisationCodes,
      organisationCodes,
    )

    if (normalizedOrganisationCodes.length === 0) {
      return []
    }

    const organisations = await Organisation.findAll({
      where: {
        code: {
          [Op.in]: normalizedOrganisationCodes,
        },
      },
    })

    let organisationAccess = organisations.map((organisation) => ({
      organisation,
      access: access[codeByNormalizedCode[organisation.code]],
    }))

    if (isVaradekaani(this)) {
      organisationAccess = organisationAccess.map(({ organisation }) => ({
        organisation,
        access: { read: true, write: true, admin: true },
      }))
    }

    return organisationAccess
  }

  async getOrganisationAccessByCourseUnitId(courseUnitId) {
    const organisations = await this.getOrganisationAccess()

    if (organisations.length === 0) {
      return null
    }

    const courseOrganisations = await sequelize.query(
      `
      SELECT organisation_id FROM course_units_organisations WHERE course_unit_id = :courseUnitId
    `,
      {
        replacements: {
          courseUnitId,
        },
        type: sequelize.QueryTypes.SELECT,
      },
    )

    const organisationIds = courseOrganisations.map((co) => co.organisation_id)

    const organisationAccess = organisations.find(({ organisation }) =>
      organisationIds.includes(organisation.id),
    )

    return organisationAccess?.access ?? null
  }

  async getResponsibleCourseCodes() {
    const rows = await sequelize.query(
      `
      SELECT DISTINCT ON (course_units.course_code) course_units.course_code
      FROM user_feedback_targets
      INNER JOIN feedback_targets ON user_feedback_targets.feedback_target_id = feedback_targets.id
      INNER JOIN course_units ON feedback_targets.course_unit_id = course_units.id
      WHERE user_feedback_targets.user_id = :userId AND user_feedback_targets.access_status = 'TEACHER';
    `,
      {
        replacements: {
          userId: this.id,
        },
        type: sequelize.QueryTypes.SELECT,
      },
    )

    return rows.map((row) => row.course_code)
  }

  toJSON() {
    return _.omit(this.get(), ['iamGroups'])
  }
}

User.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: STRING,
      allowNull: false,
    },
    firstName: {
      type: STRING,
    },
    lastName: {
      type: STRING,
    },
    email: {
      type: STRING,
    },
    employeeNumber: {
      type: STRING,
    },
    language: {
      type: STRING,
    },
    studentNumber: {
      type: STRING,
    },
    iamGroups: {
      type: VIRTUAL,
      defaultValue: [],
    },
    degreeStudyRight: {
      type: BOOLEAN,
      allowNull: true,
    },
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = User
