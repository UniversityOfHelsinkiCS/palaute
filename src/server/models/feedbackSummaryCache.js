const { STRING, INTEGER, Model, JSONB, DATEONLY } = require('sequelize')
const { sequelize } = require('../util/dbConnection')

class FeedbackSummaryCache extends Model {}

FeedbackSummaryCache.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    course_realisation_id: {
      type: STRING,
      allowNull: false,
    },
    organisation_id: {
      type: STRING,
      allowNull: false,
    },
    course_realisation_start_date: {
      type: DATEONLY,
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
    tableName: 'feedback_summary_cache',
    timestamps: false,
  },
)

module.exports = FeedbackSummaryCache
