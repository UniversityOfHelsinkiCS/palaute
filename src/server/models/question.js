const { VIRTUAL } = require('sequelize')
const { Model, JSONB, STRING, BOOLEAN } = require('sequelize')
const { WORKLOAD_QUESTION_ID } = require('../../config')
const { sequelize } = require('../db/dbConnection')

class Question extends Model {}

Question.init(
  {
    type: {
      type: STRING,
      allowNull: false,
    },
    secondaryType: {
      type: VIRTUAL,
      get() {
        return this.id === WORKLOAD_QUESTION_ID ? 'WORKLOAD' : 'OTHER'
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

module.exports = Question
