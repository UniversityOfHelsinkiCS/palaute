const { DATE, NOW, STRING } = require('sequelize')
const { Model } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

class UpdaterStatus extends Model {}

UpdaterStatus.init(
  {
    startedAt: {
      type: DATE,
      defaultValue: NOW,
      allowNull: false,
    },
    finishedAt: {
      type: DATE,
      allowNull: true,
    },
    status: {
      type: STRING(16),
      allowNull: false,
      defaultValue: 'IDLE',
    },
    jobType: {
      type: STRING(16),
      allowNull: true,
      defaultValue: 'NIGHTLY',
    },
  },
  {
    underscored: true,
    timestamps: false,
    sequelize,
  },
)

module.exports = UpdaterStatus
