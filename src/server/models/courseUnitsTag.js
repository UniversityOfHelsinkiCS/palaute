const { Model, INTEGER, STRING } = require('sequelize')
const { sequelize } = require('../db/dbConnection')
const CourseUnit = require('./courseUnit')

class CourseUnitsTag extends Model {}

CourseUnitsTag.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    courseCode: {
      type: STRING,
      allowNull: false,
      references: {
        model: CourseUnit,
        key: 'courseCode',
      },
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

module.exports = CourseUnitsTag
