const {
  Op,
  Model,
  STRING,
  INTEGER,
  ARRAY,
  ENUM,
  VIRTUAL,
} = require('sequelize')
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
      values: ['feedbackTarget', 'programme', 'university'],
    },
    typeId: {
      type: STRING,
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
