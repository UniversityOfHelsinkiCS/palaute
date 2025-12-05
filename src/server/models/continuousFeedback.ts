import {
  Model,
  INTEGER,
  STRING,
  JSONB,
  BOOLEAN,
  TEXT,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DATE,
} from 'sequelize'
import { sequelize } from '../db/dbConnection'
import type { User } from './user'
import type { FeedbackTarget } from './feedbackTarget'

class ContinuousFeedback extends Model<
  InferAttributes<ContinuousFeedback>,
  InferCreationAttributes<ContinuousFeedback>
> {
  // --- Acual DB columns ---
  // ------------------------
  declare id: CreationOptional<number>
  declare data: Record<string, any>
  declare userId: string
  declare feedbackTargetId: number
  declare sendInDigestEmail: CreationOptional<boolean>
  declare response: CreationOptional<string>
  declare responseEmailSent: CreationOptional<boolean>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare user?: User
  declare feedbackTarget?: FeedbackTarget
}

ContinuousFeedback.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    data: {
      type: JSONB,
      allowNull: false,
    },
    userId: {
      type: STRING,
      allowNull: false,
    },
    feedbackTargetId: {
      type: INTEGER,
      allowNull: false,
    },
    sendInDigestEmail: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    response: {
      type: TEXT,
    },
    responseEmailSent: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DATE,
    },
    updatedAt: {
      type: DATE,
    },
  },
  {
    underscored: true,
    timestamps: true,
    sequelize,
  }
)

export { ContinuousFeedback }
