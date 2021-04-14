const { DATE, ENUM, STRING, Model, JSONB } = require('sequelize')
const CourseUnit = require('./courseUnit')
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

FeedbackTarget.CourseUnit = FeedbackTarget.belongsTo(CourseUnit, {
  as: 'courseUnit',
})

module.exports = FeedbackTarget
