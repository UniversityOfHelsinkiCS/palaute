const { Model, STRING, JSONB } = require('sequelize')
const { sequelize } = require('../util/dbConnection')

class AssessmentItem extends Model {}

AssessmentItem.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: JSONB,
      allowNull: false,
    },
    nameSpecifier: {
      type: JSONB,
      allowNull: false,
    },
    assessmentItemType: {
      type: STRING,
      allowNull: false,
    },
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = AssessmentItem
