const { Model, STRING, Op, BOOLEAN, DATE, QueryTypes, VIRTUAL, ARRAY } = require('sequelize')
const _ = require('lodash')

const { sequelize } = require('../db/dbConnection')
const Organisation = require('./organisation')
const { getOrganisationAccess } = require('../services/organisationAccess')
const UserFeedbackTarget = require('./userFeedbackTarget')
const { ADMINS } = require('../util/config')

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
        as: 'users',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
    })

    return organisations.map(org => ({
      access: organisationAccess[org.code],
      organisation: org,
    }))
  }

  async isTeacher() {
    const teachings = await UserFeedbackTarget.findAll({
      where: {
        userId: this.id,
        accessStatus: { [Op.in]: ['TEACHER', 'RESPONSIBLE_TEACHER'] },
      },
    })

    return teachings?.length > 0
  }

  async getOrganisationAccessByCourseUnitId(courseUnitId) {
    const organisations = await this.getOrganisationAccess()

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

    const organisationAccess = organisations
      .filter(({ organisation }) => organisationIds.includes(organisation.id))
      .reduce((finalAccess, org) => ({ ...finalAccess, ...org.access }), {})

    return organisationAccess ?? null
  }

  /**
   *
   * @param {FeedbackTarget | number} feedbackTarget
   * @returns {UserFeedbackTarget}
   */
  async getTeacherAssociation(feedbackTarget) {
    return UserFeedbackTarget.findOne({
      where: {
        feedbackTargetId: typeof feedbackTarget === 'number' ? feedbackTarget : feedbackTarget.id,
        userId: this.id,
        [Op.or]: [{ accessStatus: 'RESPONSIBLE_TEACHER' }, { accessStatus: 'TEACHER' }],
      },
    })
  }

  getDefaultEmail() {
    if (this.id === this.username) {
      return this.secondaryEmail ?? this.email
    }
    return this.email ?? this.secondaryEmail
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
    lastLoggedIn: {
      type: DATE,
      allowNull: true,
    },
    isAdmin: {
      type: VIRTUAL,
      get() {
        return ADMINS?.includes(this.username)
      },
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

module.exports = User
