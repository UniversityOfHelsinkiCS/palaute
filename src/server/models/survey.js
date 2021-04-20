const { Op, Model, INTEGER, ARRAY, JSONB, VIRTUAL } = require('sequelize')
const { sequelize } = require('../util/dbConnection')
const Question = require('./question')

class Survey extends Model {
  async getQuestions() {
    const questions = await Question.findAll({
      where: {
        id: {
          [Op.in]: this.questionIds,
        },
      },
    })

    return questions
  }
}

Survey.init(
  {
    data: {
      type: JSONB,
      allowNull: false,
    },
    questionIds: {
      type: ARRAY(INTEGER),
      allowNull: false,
    },
    feedbackTargetId: {
      type: INTEGER,
      allowNull: false,
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

module.exports = Survey
