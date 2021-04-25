const { Model, JSONB, STRING, ARRAY } = require('sequelize')
const { sequelize } = require('../util/dbConnection')

class CourseUnit extends Model {}

CourseUnit.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
      allowNull: false,
    },
    courseCode: {
      type: STRING,
    },
    validityPeriod: {
      type: JSONB,
    },
    name: {
      type: JSONB,
      allowNull: false,
    },
    primaryOrganisationId: {
      type: STRING,
    },
    organisationIds: {
      type: ARRAY(STRING),
    },
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = CourseUnit
