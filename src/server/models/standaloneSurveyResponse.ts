import type { QuestionAnswer } from '@common/types/question'

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

class StandaloneSurveyResponse extends Model<
  InferAttributes<StandaloneSurveyResponse>,
  InferCreationAttributes<StandaloneSurveyResponse>
> {
  declare id: CreationOptional<number>
  declare standaloneSurveyId: number
  declare userId: string
  declare data: QuestionAnswer[]
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

StandaloneSurveyResponse.init(
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

export { StandaloneSurveyResponse }
