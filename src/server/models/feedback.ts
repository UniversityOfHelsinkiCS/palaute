import {
  Model,
  JSONB,
  STRING,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  BOOLEAN,
  DATE,
  INTEGER,
} from 'sequelize'
import { sequelize } from '../db/dbConnection'
import UserFeedbackTarget from './userFeedbackTarget'

export type QuestionAnswer = {
  questionId: number
  data: string
}

export type FeedbackData = QuestionAnswer[]

class Feedback extends Model<InferAttributes<Feedback>, InferCreationAttributes<Feedback>> {
  declare id: CreationOptional<number>
  declare data: FeedbackData
  declare userId: string
  declare degreeStudyRight: boolean | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  toPublicObject() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      data: this.data,
    }
  }
}

Feedback.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
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
    degreeStudyRight: {
      type: BOOLEAN,
      allowNull: true,
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

Feedback.beforeDestroy(async feedback => {
  await UserFeedbackTarget.update(
    {
      feedbackId: null,
    },
    { where: { feedbackId: feedback.id } }
  )
})

export default Feedback
