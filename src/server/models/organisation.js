const { Model, JSONB, STRING, BOOLEAN } = require('sequelize')
const { sequelize } = require('../util/dbConnection')

class Organisation extends Model {}

Organisation.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: JSONB,
    },
    code: {
      type: STRING,
    },
    parentId: {
      type: STRING,
    },
    studentListVisible: {
      type: BOOLEAN,
      allowNull: false,
    },
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = Organisation
