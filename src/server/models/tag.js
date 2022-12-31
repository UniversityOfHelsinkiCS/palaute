const { JSONB } = require('sequelize')
const { VIRTUAL } = require('sequelize')
const { Model, INTEGER, STRING } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

/* eslint-disable */
// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
const hash = s =>
  Math.abs(
    s.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
  )
/* eslint-enable */

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
    hash: {
      type: VIRTUAL,
      get() {
        return hash(this.name.fi)
      },
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

module.exports = Tag
