const { STRING, INTEGER, Model } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

class OrganisationFeedbackCorrespondent extends Model {}

OrganisationFeedbackCorrespondent.init(
  {
    id: {
      primaryKey: true,
      type: INTEGER,
      allowNull: false,
      autoIncrement: true,
    },
    userId: {
      type: STRING,
      allowNull: false,
    },
    organisationId: {
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

module.exports = OrganisationFeedbackCorrespondent
