const {
  DATE,
  ENUM,
  STRING,
  Model,
  JSONB,
  BOOLEAN,
  VIRTUAL,
} = require('sequelize')

const CourseUnit = require('./courseUnit')
const { sequelize } = require('../util/dbConnection')
const Survey = require('./survey')

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

    return this.opensAt < now && this.closesAt > now
  }

  isEnded() {
    if (!this.closesAt) {
      return true
    }

    const now = new Date()

    return now > this.closesAt
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
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = FeedbackTarget
