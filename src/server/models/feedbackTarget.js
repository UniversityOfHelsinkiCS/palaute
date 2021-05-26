const {
  DATE,
  ENUM,
  STRING,
  Model,
  JSONB,
  BOOLEAN,
  VIRTUAL,
  ARRAY,
  INTEGER,
  TEXT,
} = require('sequelize')

const _ = require('lodash')

const CourseUnit = require('./courseUnit')
const { sequelize } = require('../util/dbConnection')
const Survey = require('./survey')

const getGloballyPublicQuestionIds = async () => {
  const universitySurvey = await Survey.findOne({
    where: { type: 'university' },
  })

  await universitySurvey.populateQuestions()

  const numericQuestionIds = universitySurvey.questions
    .filter(({ type }) => type === 'LIKERT')
    .map(({ id }) => id)

  return numericQuestionIds
}

class FeedbackTarget extends Model {
  async getSurveys() {
    const courseUnit = await CourseUnit.findByPk(this.courseUnitId)

    const [defaultSurvey] = await Survey.findOrCreate({
      where: {
        type: 'courseUnit',
        typeId: courseUnit.courseCode,
      },
      defaults: {
        questionIds: [],
        type: 'courseUnit',
        typeId: courseUnit.courseCode,
      },
    })

    const [teacherSurvey] = await Survey.findOrCreate({
      where: {
        feedbackTargetId: this.id,
      },
      defaults: {
        questionIds: defaultSurvey.questionIds,
      },
    })

    await teacherSurvey.populateQuestions()

    const departmentSurvey = {} // await Survey.findOne()

    const universitySurvey = await Survey.findOne({
      where: { type: 'university' },
    })

    await universitySurvey.populateQuestions()

    return {
      teacherSurvey,
      departmentSurvey,
      universitySurvey,
    }
  }

  isOpen() {
    if (!this.opensAt || !this.closesAt) {
      return true
    }

    const now = new Date()

    return this.opensAt <= now && this.closesAt >= now
  }

  isEnded() {
    if (!this.closesAt) {
      return true
    }

    const now = new Date()

    return now > this.closesAt
  }

  async getPublicQuestionIds() {
    const targetPublicQuestionIds = this.publicQuestionIds ?? []

    const globallyPublicQuestionIds = await getGloballyPublicQuestionIds()

    const publicQuestionIds = _.uniq([
      ...targetPublicQuestionIds,
      ...globallyPublicQuestionIds,
    ])

    return publicQuestionIds
  }

  async getPublicityConfigurableQuestionIds() {
    await this.populateQuestions()

    const globallyPublicQuestionIds = await getGloballyPublicQuestionIds()

    const questionIds = this.questions
      .filter(({ id }) => !globallyPublicQuestionIds.includes(id))
      .map(({ id }) => id)

    return questionIds
  }

  async populateQuestions() {
    const surveys = await this.getSurveys()

    const questions = [
      ...(surveys.universitySurvey?.questions ?? []),
      ...(surveys.departmentSurvey?.questions ?? []),
      ...(surveys.teacherSurvey?.questions ?? []),
    ]

    this.set('questions', questions)
  }

  async getPublicFeedbacks(feedbacks, { accessStatus, isAdmin } = {}) {
    const publicFeedbacks = feedbacks.map((f) => f.toPublicObject())

    if (isAdmin) {
      return publicFeedbacks
    }

    if (publicFeedbacks.length <= 5) return []

    const filteredFeedbacks = publicFeedbacks.map((feedback) => ({
      ...feedback,
      data: feedback.data.filter((question) => {
        if (accessStatus === 'STUDENT')
          return this.publicQuestionIds.includes(question.questionId)
        return true
      }),
    }))

    return filteredFeedbacks
  }

  async toPublicObject() {
    const [
      surveys,
      publicQuestionIds,
      publicityConfigurableQuestionIds,
    ] = await Promise.all([
      this.getSurveys(),
      this.getPublicQuestionIds(),
      this.getPublicityConfigurableQuestionIds(),
      this.populateQuestions(),
    ])

    const feedbackTarget = {
      ...this.toJSON(),
      surveys,
      publicQuestionIds,
      publicityConfigurableQuestionIds,
    }

    delete feedbackTarget.userFeedbackTargets

    return feedbackTarget
  }
}

FeedbackTarget.init(
  {
    feedbackType: {
      type: ENUM,
      values: ['courseRealisation', 'assessmentItem', 'studySubGroup'],
      allowNull: false,
      unique: 'source',
    },
    typeId: {
      type: STRING,
      allowNull: false,
      unique: 'source',
    },
    courseUnitId: {
      type: STRING,
      allowNull: false,
    },
    courseRealisationId: {
      type: STRING,
      allowNull: false,
    },
    name: {
      type: JSONB,
      allowNull: false,
    },
    hidden: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    opensAt: {
      type: DATE,
    },
    closesAt: {
      type: DATE,
    },
    questions: {
      type: VIRTUAL,
    },
    publicQuestionIds: {
      type: ARRAY(INTEGER),
      allowNull: false,
      defaultValue: [],
    },
    feedbackResponse: {
      type: TEXT,
    },
    feedbackVisibility: {
      type: TEXT,
      defaultValue: 'ENROLLED',
    },
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = FeedbackTarget
