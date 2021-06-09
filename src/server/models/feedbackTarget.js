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
const Organisation = require('./organisation')
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
    const courseUnit = await CourseUnit.findByPk(this.courseUnitId, {
      include: [{ model: Organisation, as: 'organisations' }],
    })

    const organisation = courseUnit.organisations[0]

    const feedbackTargets = await FeedbackTarget.findAll({
      where: {
        courseUnitId: courseUnit.id,
      },
    })

    const mostRecentCourse = feedbackTargets.reduce((a, b) =>
      a.opensAt > b.opensAt ? a : b,
    )

    const filteredQuestionIds = mostRecentCourse.publicQuestionIds.filter(
      (q) => q > 11,
    )

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

    teacherSurvey.questionIds = teacherSurvey.questionIds.length === 0
      ? filteredQuestionIds
      : teacherSurvey.questionIds

    const [universitySurvey, programmeSurvey] = await Promise.all([
      Survey.findOne({
        where: { type: 'university' },
      }),
      organisation
        ? Survey.findOne({
            where: { type: 'programme', typeId: organisation.code },
          })
        : null,
    ])

    await Promise.all([
      teacherSurvey.populateQuestions(),
      universitySurvey.populateQuestions(),
      programmeSurvey?.populateQuestions(),
    ])

    return {
      teacherSurvey,
      programmeSurvey,
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
      ...(surveys.programmeSurvey?.questions ?? []),
      ...(surveys.teacherSurvey?.questions ?? []),
    ]

    this.set('questions', questions)
  }

  async getPublicFeedbacks(feedbacks, { accessStatus, isAdmin } = {}) {
    const publicFeedbacks = feedbacks.map((f) => f.toPublicObject())

    if (isAdmin) {
      return publicFeedbacks
    }

    if (publicFeedbacks.length < 5) return []

    const publicQuestionIds = await this.getPublicQuestionIds()

    const filteredFeedbacks = publicFeedbacks.map((feedback) => ({
      ...feedback,
      data: feedback.data.filter((question) => {
        if (accessStatus === 'STUDENT')
          return publicQuestionIds.includes(question.questionId)
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
