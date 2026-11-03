import {
  Model,
  INTEGER,
  STRING,
  DATE,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize'

import type { User } from './user'

import { sequelize } from '../db/dbConnection'

class StandaloneSurveyResponsibleUser extends Model<
  InferAttributes<StandaloneSurveyResponsibleUser>,
  InferCreationAttributes<StandaloneSurveyResponsibleUser>
> {
  declare id: CreationOptional<number>
  declare standaloneSurveyId: number
  declare userId: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare user?: NonAttribute<User>
}

StandaloneSurveyResponsibleUser.init(
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

export { StandaloneSurveyResponsibleUser }
