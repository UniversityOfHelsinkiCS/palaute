const { Model, INTEGER, STRING } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

class CourseRealisationsOrganisation extends Model {}

CourseRealisationsOrganisation.init(
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
    courseRealisationId: {
      type: STRING,
      allowNull: false,
    },
    organisationId: {
      type: STRING,
      allowNull: false,
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

module.exports = CourseRealisationsOrganisation
