import {
  Model,
  INTEGER,
  DATE,
  ENUM,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize'

import type { Question } from './question'

import { sequelize } from '../db/dbConnection'

export const STANDALONE_QUESTION_VISIBILITIES = ['PUBLIC', 'PRIVATE'] as const

export type StandaloneQuestionVisibility = (typeof STANDALONE_QUESTION_VISIBILITIES)[number]

class StandaloneSurveyQuestion extends Model<
  InferAttributes<StandaloneSurveyQuestion>,
  InferCreationAttributes<StandaloneSurveyQuestion>
> {
  declare id: CreationOptional<number>
  declare standaloneSurveyId: number
  declare questionId: number
  declare position: number
  declare visibility: CreationOptional<StandaloneQuestionVisibility>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare question?: NonAttribute<Question>
}

StandaloneSurveyQuestion.init(
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
    questionId: {
      type: INTEGER,
      allowNull: false,
      unique: true,
    },
    position: {
      type: INTEGER,
      allowNull: false,
    },
    visibility: {
      type: ENUM(...STANDALONE_QUESTION_VISIBILITIES),
      allowNull: false,
      defaultValue: 'PRIVATE',
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

export { StandaloneSurveyQuestion }
