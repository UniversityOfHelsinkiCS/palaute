const { Model, JSONB, STRING } = require('sequelize')
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
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = Organisation
