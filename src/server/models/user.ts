import {
  Model,
  STRING,
  Op,
  BOOLEAN,
  DATE,
  VIRTUAL,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize'
import _ from 'lodash'

import { sequelize } from '../db/dbConnection'
import { UserFeedbackTarget } from './userFeedbackTarget'
import type { FeedbackTarget } from './feedbackTarget'

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  // --- Acual DB columns ---
  // ------------------------
  declare id: string
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
  declare iamGroups?: string[]

  async isTeacher() {
    const teachings = await UserFeedbackTarget.findAll({
      where: {
        userId: this.id,
        accessStatus: { [Op.in]: ['TEACHER', 'RESPONSIBLE_TEACHER'] },
      },
    })

    return teachings?.length > 0
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
