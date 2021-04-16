const { DATE, ENUM, STRING, Model, JSONB } = require('sequelize')
const { sequelize } = require('../util/dbConnection')

class FeedbackTarget extends Model {}

FeedbackTarget.init(
  {
    feedbackType: {
      type: ENUM,
      values: ['courseRealisation', 'assessmentItem', 'studySubGroup'],
      allowNull: false,
      unique: 'source',
    },
    typeId: {
      type: STRING,
      allowNull: false,
      unique: 'source',
    },
    courseUnitId: {
      type: STRING,
      allowNull: false,
    },
    courseRealisationId: {
      type: STRING,
      allowNull: false,
    },
    name: {
      type: JSONB,
      allowNull: false,
    },
    opensAt: {
      type: DATE,
    },
    closesAt: {
      type: DATE,
    },
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = FeedbackTarget
