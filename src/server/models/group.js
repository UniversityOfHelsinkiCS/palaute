const { INTEGER } = require('sequelize')
const { VIRTUAL } = require('sequelize')
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
    feedbackTargetId: {
      type: INTEGER,
      allowNull: false,
    },
    name: {
      type: JSONB,
    },
    teachers: {
      type: VIRTUAL,
    },
    studentCount: {
      type: VIRTUAL,
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

module.exports = Group
