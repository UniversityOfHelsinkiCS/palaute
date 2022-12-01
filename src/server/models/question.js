const { Model, JSONB, STRING, BOOLEAN } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

class Question extends Model {}

Question.init(
  {
    type: {
      type: STRING,
      allowNull: false,
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
  },
)

module.exports = Question
