const { STRING } = require('sequelize')
const { Model, JSONB } = require('sequelize')
const { sequelize } = require('../util/dbConnection')

class Feedback extends Model {}

Feedback.init(
  {
    data: {
      type: JSONB,
      allowNull: false,
    },
    userId: {
      type: STRING,
      allowNull: false,
    },
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = Feedback
