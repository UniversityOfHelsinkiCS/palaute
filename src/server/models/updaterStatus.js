const { DATE, NOW, STRING } = require('sequelize')
const { Model } = require('sequelize')
const { sequelize } = require('../util/dbConnection')

class UpdaterStatus extends Model {
  toPublicObject() {
    return {
      startedAt: this.started_at,
      finishedAt: this.finished_at,
      status: this.status,
    }
  }
}

UpdaterStatus.init(
  {
    started_at: {
      type: DATE,
      defaultValue: NOW,
      allowNull: false,
    },
    finished_at: {
      type: DATE,
      allowNull: true,
    },
    status: {
      type: STRING(16),
      allowNull: false,
      defaultValue: 'IDLE',
    },
  },
  {
    underscored: true,
    timestamps: false,
    sequelize,
  },
)

module.exports = UpdaterStatus
