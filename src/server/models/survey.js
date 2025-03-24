const { Op, Model, STRING, INTEGER, ARRAY, ENUM, VIRTUAL } = require('sequelize')

const { sequelize } = require('../db/dbConnection')
const { Question } = require('./question')

class Survey extends Model {
  /**
   * @param {Survey} survey
   * @returns {Promise<Question[]>}
   */
  static async getQuestionsOfSurvey(survey) {
    const questions = await Question.findAll({
      where: {
        id: {
          [Op.in]: survey.questionIds,
        },
      },
    })

    const questionIdOrder = {}

    for (let i = 0; i < survey.questionIds.length; ++i) {
      questionIdOrder[survey.questionIds[i]] = i
    }
    questions.sort((a, b) => questionIdOrder[a.id] - questionIdOrder[b.id])
    return questions
  }

  async getQuestions() {
    return Survey.getQuestionsOfSurvey(this)
  }

  async populateQuestions() {
    this.set('questions', await this.getQuestions())
  }
}

Survey.init(
  {
    questionIds: {
      type: ARRAY(INTEGER),
      allowNull: false,
    },
    feedbackTargetId: {
      type: INTEGER,
    },
    type: {
      type: ENUM,
      values: ['feedbackTarget', 'courseUnit', 'programme', 'university'],
    },
    typeId: {
      type: STRING,
    },
    questions: {
      type: VIRTUAL,
    },
    publicQuestionIds: {
      type: VIRTUAL,
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

module.exports = Survey
