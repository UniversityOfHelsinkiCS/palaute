const { Model, JSONB, STRING } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

class Group extends Model {}

Group.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
      allowNull: false,
    },
    courseRealisationId: {
      type: STRING,
      allowNull: false,
    },
    name: {
      type: JSONB,
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

module.exports = Group
