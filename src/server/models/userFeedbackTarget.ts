import {
  Op,
  STRING,
  INTEGER,
  Model,
  BOOLEAN,
  ARRAY,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize'
import { sequelize } from '../db/dbConnection'
import type { User } from './user'
import type Feedback from './feedback'
import type { FeedbackTarget } from './feedbackTarget'

export type AccessStatus = 'STUDENT' | 'TEACHER' | 'RESPONSIBLE_TEACHER'

class UserFeedbackTarget extends Model<
  InferAttributes<UserFeedbackTarget>,
  InferCreationAttributes<UserFeedbackTarget>
> {
  public id!: CreationOptional<number>
  public accessStatus!: AccessStatus
  public feedbackId!: number
  public groupIds: string[] | null
  public userId!: string
  public feedbackTargetId!: number
  public feedbackOpenEmailSent!: boolean
  public isAdministrativePerson!: boolean
  public userCreated!: boolean
  public notGivingFeedback!: boolean

  declare user?: User
  declare feedbackTarget?: FeedbackTarget
  declare feedback?: NonAttribute<Feedback>

  public hasTeacherAccess(): boolean {
    return this.accessStatus === 'RESPONSIBLE_TEACHER' || this.accessStatus === 'TEACHER'
  }

  public hasStudentAccess(): boolean {
    return this.accessStatus === 'STUDENT'
  }
}

UserFeedbackTarget.init(
  {
    id: {
      primaryKey: true,
      type: INTEGER,
      allowNull: false,
      autoIncrement: true,
    },
    accessStatus: {
      type: STRING,
      allowNull: false,
    },
    feedbackId: {
      type: INTEGER,
      allowNull: true,
    },
    groupIds: {
      type: ARRAY(STRING),
      allowNull: true,
    },
    userId: {
      type: STRING,
      allowNull: false,
    },
    feedbackTargetId: {
      type: INTEGER,
      allowNull: false,
    },
    feedbackOpenEmailSent: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isAdministrativePerson: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    userCreated: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    notGivingFeedback: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    underscored: true,
    sequelize,

    scopes: {
      students: {
        where: {
          accessStatus: 'STUDENT',
        },
      },
      teachers: {
        where: {
          accessStatus: { [Op.in]: ['RESPONSIBLE_TEACHER', 'TEACHER'] },
        },
      },
    },
  }
)

export { UserFeedbackTarget }
