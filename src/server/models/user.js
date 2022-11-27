const {
  Model,
  STRING,
  Op,
  BOOLEAN,
  ARRAY,
  DATE,
  QueryTypes,
} = require('sequelize')
const _ = require('lodash')

const { sequelize } = require('../util/dbConnection')
const Organisation = require('./organisation')
const { getOrganisationAccess } = require('../util/organisationAccess')
const UserFeedbackTarget = require('./userFeedbackTarget')

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

    return organisations.map((org) => ({
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
      },
    )

    const organisationIds = rows.flatMap((row) => Object.values(row))

    const organisationAccess = organisations
      .filter(({ organisation }) => organisationIds.includes(organisation.id))
      .reduce((finalAccess, org) => ({ ...finalAccess, ...org.access }), {})

    return organisationAccess ?? null
  }

  async getResponsibleCourseCodes() {
    const rows = await sequelize.query(
      `
      SELECT DISTINCT ON (course_units.course_code) course_units.course_code
      FROM user_feedback_targets
      INNER JOIN feedback_targets ON user_feedback_targets.feedback_target_id = feedback_targets.id
      INNER JOIN course_units ON feedback_targets.course_unit_id = course_units.id
      WHERE user_feedback_targets.user_id = :userId AND
      (user_feedback_targets.access_status = 'RESPONSIBLE_TEACHER' OR user_feedback_targets.access_status = 'TEACHER');
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

  /**
   *
   * @param {FeedbackTarget | number} feedbackTarget
   * @returns {UserFeedbackTarget}
   */
  async getTeacherAssociation(feedbackTarget) {
    return UserFeedbackTarget.findOne({
      where: {
        feedbackTargetId:
          typeof feedbackTarget === 'number'
            ? feedbackTarget
            : feedbackTarget.id,
        userId: this.id,
        [Op.or]: [
          { accessStatus: 'RESPONSIBLE_TEACHER' },
          { accessStatus: 'TEACHER' },
        ],
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
    iamGroups: {
      type: ARRAY(STRING),
      allowNull: false,
      defaultValue: [],
    },
    lastLoggedIn: {
      type: DATE,
      allowNull: true,
    },
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = User
