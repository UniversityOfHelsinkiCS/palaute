const { Model, STRING, Op, BOOLEAN, ARRAY } = require('sequelize')
const _ = require('lodash')

const { sequelize } = require('../util/dbConnection')
const Organisation = require('./organisation')
const { getOrganisationAccess } = require('../util/organisationAccess')

class User extends Model {
  async getOrganisationAccess() {
    const organisationAccess = await getOrganisationAccess(this)

    const organisations = await Organisation.findAll({
      where: {
        code: {
          [Op.in]: Object.keys(organisationAccess),
        },
      },
      include: {
        model: User,
        as: 'responsible_user',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
    })

    return organisations.map((org) => ({
      access: organisationAccess[org.code],
      organisation: org,
    }))
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
    secondaryEmail: {
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
    degreeStudyRight: {
      type: BOOLEAN,
      allowNull: true,
    },
    norppaFeedbackGiven: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    iamGroups: {
      type: ARRAY(STRING),
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = User
