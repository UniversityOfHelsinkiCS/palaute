const { STRING } = require('sequelize')
const { Model, JSONB, DATE } = require('sequelize')
const { sequelize } = require('../util/dbConnection')

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

module.exports = CourseRealisation
