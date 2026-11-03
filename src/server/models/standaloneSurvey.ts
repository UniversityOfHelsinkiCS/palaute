import type { LocalizedString } from '@common/types/common'

import {
  Model,
  INTEGER,
  STRING,
  DATE,
  JSONB,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize'

import type { StandaloneSurveyQuestion } from './standaloneSurveyQuestion'
import type { StandaloneSurveyResponsibleUser } from './standaloneSurveyResponsibleUser'

import { sequelize } from '../db/dbConnection'

class StandaloneSurvey extends Model<InferAttributes<StandaloneSurvey>, InferCreationAttributes<StandaloneSurvey>> {
  declare id: CreationOptional<number>
  declare name: LocalizedString
  declare token: string
  declare opensAt: Date
  declare closesAt: Date
  declare createdByUserId: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare surveyQuestions?: NonAttribute<StandaloneSurveyQuestion[]>
  declare responsibleUsers?: NonAttribute<StandaloneSurveyResponsibleUser[]>

  isOpen(now = new Date()): boolean {
    return this.opensAt <= now && now < this.closesAt
  }

  isEnded(now = new Date()): boolean {
    return this.closesAt <= now
  }
}

StandaloneSurvey.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      type: JSONB,
      allowNull: false,
    },
    token: {
      type: STRING,
      allowNull: false,
      unique: true,
    },
    opensAt: {
      type: DATE,
      allowNull: false,
    },
    closesAt: {
      type: DATE,
      allowNull: false,
    },
    createdByUserId: {
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
    sequelize,
  }
)

export { StandaloneSurvey }
