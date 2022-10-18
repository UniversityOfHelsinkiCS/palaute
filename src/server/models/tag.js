const { JSONB } = require('sequelize')
const { Model, INTEGER, STRING } = require('sequelize')
const { sequelize } = require('../util/dbConnection')

class Tag extends Model {}

Tag.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    organisationId: {
      type: STRING,
      references: { model: 'organisations', key: 'id' },
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

module.exports = Tag
