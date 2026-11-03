import {
  Model,
  INTEGER,
  STRING,
  DATE,
  JSONB,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize'

import { sequelize } from '../db/dbConnection'

class StandaloneSurveyLog extends Model<
  InferAttributes<StandaloneSurveyLog>,
  InferCreationAttributes<StandaloneSurveyLog>
> {
  declare id: CreationOptional<number>
  declare standaloneSurveyId: number
  declare userId: string
  declare data: Record<string, unknown>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

StandaloneSurveyLog.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    standaloneSurveyId: {
      type: INTEGER,
      allowNull: false,
    },
    userId: {
      type: STRING,
      allowNull: false,
    },
    data: {
      type: JSONB,
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
    sequelize,
  }
)

export { StandaloneSurveyLog }
