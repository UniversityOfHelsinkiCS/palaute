import {
  Model,
  STRING,
  Op,
  BOOLEAN,
  DATE,
  QueryTypes,
  VIRTUAL,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize'
import _ from 'lodash'

import { OrganisationAccess } from '@common/types'
import { sequelize } from '../db/dbConnection'
import { UserFeedbackTarget } from './userFeedbackTarget'
import Organisation from './organisation'
import type { FeedbackTarget } from './feedbackTarget'

export type OrganisationWithAccess = {
  access: OrganisationAccess
  organisation: Organisation
}

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  // --- Acual DB columns ---
  // ------------------------
  declare id: CreationOptional<string>
  declare username: string
  declare firstName: CreationOptional<string | null>
  declare lastName: CreationOptional<string | null>
  declare email: CreationOptional<string | null>
  declare secondaryEmail: CreationOptional<string | null>
  declare language: CreationOptional<string | null>
  declare studentNumber: CreationOptional<string | null>
  declare degreeStudyRight: CreationOptional<boolean | null>
  declare norppaFeedbackGiven: CreationOptional<boolean>
  declare lastLoggedIn: CreationOptional<Date | null>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // --- Virtual fields. ---------
  // --- ideally refactor away ---
  // -----------------------------
  declare organisationAccess?: any
  declare accessibleOrganisations?: any
  declare specialGroup?: any
  declare isAdmin?: boolean
  declare isEmployee?: boolean
  declare mockedBy?: User

  // --- Helper methods ---
  // ----------------------
  declare getOrganisationAccess: () => Promise<OrganisationWithAccess[]>

  async isTeacher() {
    const teachings = await UserFeedbackTarget.findAll({
      where: {
        userId: this.id,
        accessStatus: { [Op.in]: ['TEACHER', 'RESPONSIBLE_TEACHER'] },
      },
    })

    return teachings?.length > 0
  }

  async getOrganisationAccessByCourseUnitId(courseUnitId: string) {
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

    function getPriority(org: any) {
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
      // @ts-expect-error täsäfy
      .filter(({ organisation }) => organisationIds.includes(organisation.id))
      ?.sort((a, b) => getPriority(a) - getPriority(b)) // read, write, admin. Reduce on next line practically takes the last value
      .reduce((finalAccess, org) => ({ ...finalAccess, ...org.access }), {})

    return organisationAccess ?? null
  }

  /**
   *
   * @param {FeedbackTarget | number} feedbackTarget
   * @returns {UserFeedbackTarget}
   */
  async getTeacherAssociation(feedbackTarget: FeedbackTarget | number) {
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
    createdAt: {
      type: DATE,
    },
    updatedAt: {
      type: DATE,
    },
    organisationAccess: {
      type: VIRTUAL,
    },
    accessibleOrganisations: {
      type: VIRTUAL,
    },
    specialGroup: {
      type: VIRTUAL,
    },
    isAdmin: {
      type: VIRTUAL,
    },
    isEmployee: {
      type: VIRTUAL,
    },
    mockedBy: {
      type: VIRTUAL,
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

export { User }
