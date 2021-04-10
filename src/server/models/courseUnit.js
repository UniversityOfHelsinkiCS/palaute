const { Model, JSONB, STRING } = require('sequelize')
const { sequelize } = require('../util/dbConnection')

class CourseUnit extends Model {}

CourseUnit.init(
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
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = CourseUnit
