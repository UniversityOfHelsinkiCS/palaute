const { Model, INTEGER, STRING } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

class CourseRealisationsTag extends Model {}

CourseRealisationsTag.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    courseRealisationId: {
      type: STRING,
      allowNull: false,
    },
    tagId: {
      type: INTEGER,
      allowNull: false,
    },
  },
  {
    underscored: true,
    timestamps: true,
    sequelize,
  }
)

module.exports = CourseRealisationsTag
