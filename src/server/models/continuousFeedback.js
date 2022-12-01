const { Model, INTEGER, STRING, JSONB, BOOLEAN, TEXT } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

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
    sendInDigestEmail: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    response: {
      type: TEXT,
    },
    responseEmailSent: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    underscored: true,
    timestamps: true,
    sequelize,
  },
)

module.exports = ContinuousFeedback
