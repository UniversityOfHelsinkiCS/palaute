const { Model, STRING } = require('sequelize')
const { sequelize } = require('../util/dbConnection')

class User extends Model {}

User.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: STRING,
      allowNull: false,
    },
    firstName: {
      type: STRING,
    },
    lastName: {
      type: STRING,
    },
    email: {
      type: STRING,
    },
    language: {
      type: STRING,
    },
    studentNumber: {
      type: STRING,
    },
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = User
