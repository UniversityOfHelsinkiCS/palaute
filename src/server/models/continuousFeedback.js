const { Model, INTEGER, STRING, JSONB } = require('sequelize')
const { sequelize } = require('../util/dbConnection')

class ContinuousFeedback extends Model {}

ContinuousFeedback.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    data: {
      type: JSONB,
      allowNull: false,
    },
    userId: {
      type: STRING,
      allowNull: false,
    },
    feedbackTargetId: {
      type: INTEGER,
      allowNull: false,
    },
    // responderIds?
  },
  {
    underscored: true,
    timestamps: true,
    sequelize,
  },
)

module.exports = ContinuousFeedback
