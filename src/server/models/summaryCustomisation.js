const { Model, INTEGER, STRING, JSONB } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

class SummaryCustomisation extends Model {}

SummaryCustomisation.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    userId: {
      type: STRING,
      references: { model: 'users', key: 'id' },
      allowNull: false,
    },
    data: {
      type: JSONB,
      allowNull: false,
    },
  },
  {
    underscored: true,
    timestamps: true,
    sequelize,
  },
)

module.exports = SummaryCustomisation
