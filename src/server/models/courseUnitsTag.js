const { Model, INTEGER, STRING } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

class CourseUnitsTag extends Model {}

CourseUnitsTag.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    courseUnitId: {
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

module.exports = CourseUnitsTag
