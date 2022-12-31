const { INTEGER, BOOLEAN } = require('sequelize')
const { Model } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

class FeedbackTargetDateCheck extends Model {}

FeedbackTargetDateCheck.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    feedback_target_id: {
      type: INTEGER,
      unique: true,
      references: { model: 'feedback_targets', key: 'id' },
      allowNull: false,
    },
    is_solved: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    underscored: true,
    sequelize,
    timestamps: true,
  }
)

module.exports = FeedbackTargetDateCheck
