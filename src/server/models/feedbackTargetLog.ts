import {
  Model,
  INTEGER,
  STRING,
  DATE,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  JSONB,
} from 'sequelize'
import { sequelize } from '../db/dbConnection'

class FeedbackTargetLog extends Model<InferAttributes<FeedbackTargetLog>, InferCreationAttributes<FeedbackTargetLog>> {
  declare id: CreationOptional<number>
  declare data: Record<string, unknown>
  declare feedbackTargetId: string
  declare userId: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

FeedbackTargetLog.init(
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
    feedbackTargetId: {
      type: STRING,
      allowNull: false,
    },
    userId: {
      type: STRING,
      allowNull: false,
    },
    createdAt: {
      type: DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DATE,
      allowNull: false,
    },
  },
  {
    underscored: true,
    timestamps: true,
    sequelize,
  }
)

export { FeedbackTargetLog }
