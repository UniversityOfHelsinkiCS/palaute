const { STRING, BOOLEAN } = require('sequelize')
const { Model, JSONB, DATE } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

class CourseRealisation extends Model {}

CourseRealisation.init(
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
    // no AD is given for students in this course
    isMoocCourse: {
      type: BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    userCreated: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    teachingLanguages: {
      type: JSONB,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

module.exports = CourseRealisation
