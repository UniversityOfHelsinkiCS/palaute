import type { Question as QuestionDTO, QuestionData, QuestionSecondaryType, QuestionType } from '@common/types/question'

import {
  Model,
  JSONB,
  STRING,
  BOOLEAN,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  INTEGER,
} from 'sequelize'

import { sequelize } from '../db/dbConnection'
import { WORKLOAD_QUESTION_ID } from '../util/config'

/**
 * Question represents a feedback question.
 */
class Question extends Model<InferAttributes<Question>, InferCreationAttributes<Question>> {
  declare id: CreationOptional<number>
  declare type: QuestionType
  declare secondaryType: QuestionSecondaryType
  declare required: boolean
  declare data: QuestionData

  toPublicObject(): QuestionDTO {
    const { id, type, secondaryType, required, data } = this
    // type is QuestionType (union) at compile time but always a specific literal at runtime —
    // the DB ENUM enforces the discriminant, TypeScript cannot verify it statically
    return { id, type, secondaryType, required, data } as QuestionDTO
  }
}

Question.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: STRING,
      allowNull: false,
    },
    secondaryType: {
      type: STRING,
      allowNull: true,
      get(): QuestionSecondaryType {
        const secondaryTypeValue = this.getDataValue('secondaryType') ?? 'OTHER'
        return this.id === WORKLOAD_QUESTION_ID ? 'WORKLOAD' : secondaryTypeValue
      },
    },
    required: {
      type: BOOLEAN,
      allowNull: false,
    },
    data: {
      type: JSONB,
      allowNull: false,
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

export { Question }
