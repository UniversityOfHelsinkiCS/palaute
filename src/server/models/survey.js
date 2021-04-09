const { INTEGER } = require('sequelize')
const { Model, JSONB } = require('sequelize')
const { sequelize } = require('../util/dbConnection')

class Survey extends Model {}

Survey.init(
  {
    data: {
      type: JSONB,
      allowNull: false,
    },
    feedbackTargetId: {
      type: INTEGER,
      allowNull: false,
    },
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = Survey
