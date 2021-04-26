const { STRING } = require('sequelize')
const { Model, JSONB } = require('sequelize')
const { sequelize } = require('../util/dbConnection')

class Feedback extends Model {
  toPublicObject() {
    return {
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      data: this.data,
    }
  }
}

Feedback.init(
  {
    data: {
      type: JSONB,
      allowNull: false,
    },
    userId: {
      type: STRING,
      allowNull: false,
    },
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = Feedback
