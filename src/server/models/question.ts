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
import { QuestionData, QuestionSecondaryType, QuestionType } from '@common/questionTypes'
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

export default Question
