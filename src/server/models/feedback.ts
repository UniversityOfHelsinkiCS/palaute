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
import { addFeedbackDataToSummary, removeFeedbackDataFromSummary } from 'services/summary/utils'
import { sequelize } from '../db/dbConnection'
import UserFeedbackTarget from './userFeedbackTarget'
import FeedbackTarget from './feedbackTarget'
import Summary from './summary'

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

/**
 * Increment the corresponding Summary.data.feedbackCount.
 */
Feedback.afterCreate(async feedback => {
  const summary = await Summary.findOne({
    include: [
      {
        model: FeedbackTarget,
        as: 'feedbackTarget',
        required: true,
        include: [
          {
            model: UserFeedbackTarget,
            as: 'userFeedbackTargets',
            required: true,
            where: { userId: feedback.userId },
          },
        ],
      },
    ],
  })

  if (!summary) {
    throw new Error(`Summary not found for feedback ${feedback.id}`)
  }

  let { data } = summary

  data = addFeedbackDataToSummary(data, feedback.data)

  await summary.update({ data })
})

/**
 * Decrement the corresponding Summary.data.feedbackCount.
 */
Feedback.afterDestroy(async feedback => {
  const summary = await Summary.findOne({
    include: [
      {
        model: FeedbackTarget,
        as: 'feedbackTarget',
        required: true,
        include: [
          {
            model: UserFeedbackTarget,
            as: 'userFeedbackTargets',
            required: true,
            where: { userId: feedback.userId },
          },
        ],
      },
    ],
  })

  if (!summary) {
    throw new Error(`Summary not found for feedback ${feedback.id}`)
  }

  let { data } = summary

  data = removeFeedbackDataFromSummary(data, feedback.data)

  await summary.update({ data })
})

/**
 * Remove the feedbackId the UserFeedbackTarget that references this feedback.
 */
Feedback.beforeDestroy(async feedback => {
  await UserFeedbackTarget.update(
    {
      feedbackId: null,
    },
    { where: { feedbackId: feedback.id } }
  )
})

export default Feedback
