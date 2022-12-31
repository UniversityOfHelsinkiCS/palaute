const { Model, INTEGER, STRING, JSONB } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

class OrganisationLog extends Model {}

OrganisationLog.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    data: {
      type: JSONB,
      allowNull: false,
    },
    organisationId: {
      type: STRING,
      allowNull: false,
    },
    userId: {
      type: STRING,
      allowNull: false,
    },
  },
  {
    underscored: true,
    timestamps: true,
    sequelize,
  }
)

module.exports = OrganisationLog
