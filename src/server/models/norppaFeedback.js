const { STRING } = require('sequelize')
const { BOOLEAN } = require('sequelize')
const { Model, JSONB } = require('sequelize')
const { sequelize } = require('../util/dbConnection')

class NorppaFeedback extends Model {
  toPublicObject() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      data: this.data,
    }
  }
}

NorppaFeedback.init(
  {
    data: {
      type: JSONB,
      allowNull: false,
    },
    userId: {
      type: STRING,
      allowNull: false,
    },
    responseWanted: {
      type: BOOLEAN,
      allowNull: false,
    },
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = NorppaFeedback
