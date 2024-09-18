const { Model, INTEGER, STRING, BOOLEAN } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

class CourseUnitsOrganisation extends Model {}

CourseUnitsOrganisation.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    type: {
      type: STRING,
      allowNull: false,
    },
    courseUnitId: {
      type: STRING,
      allowNull: false,
    },
    organisationId: {
      type: STRING,
      allowNull: false,
    },
    noFeedbackAllowed: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

module.exports = CourseUnitsOrganisation
