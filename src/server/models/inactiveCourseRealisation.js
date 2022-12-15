const { STRING, BOOLEAN } = require('sequelize')
const { Model, JSONB, DATE } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

class InactiveCourseRealisation extends Model {}

// Store independent work CURs and possible other inactive CURs
// so that they can be activated manually if needed
InactiveCourseRealisation.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
      allowNull: false,
    },
    endDate: {
      type: DATE,
      allowNull: false,
    },
    startDate: {
      type: DATE,
      allowNull: false,
    },
    name: {
      type: JSONB,
      allowNull: false,
    },
    educationalInstitutionUrn: {
      type: STRING,
      allowNull: true,
    },
    isMoocCourse: {
      type: BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    teachingLanguages: {
      type: JSONB,
      allowNull: true,
      defaultValue: null,
    },
    manuallyEnabled: {
      type: BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = InactiveCourseRealisation
