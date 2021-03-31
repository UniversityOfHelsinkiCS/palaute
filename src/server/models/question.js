const { STRING } = require('sequelize')
const { Model, JSONB } = require('sequelize')
const { sequelize } = require('../util/dbConnection')

class Question extends Model {}

Question.init(
  {
    data: {
      type: JSONB,
      allowNull: false,
    },
    courseRealisationId: {
      type: STRING,
      allowNull: false,
    },
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = Question
