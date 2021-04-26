const { STRING } = require('sequelize')
const { Model, JSONB } = require('sequelize')
const UserFeedbackTarget = require('./userFeedbackTarget')
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

Feedback.beforeDestroy(async (feedback) => {
  await UserFeedbackTarget.update(
    {
      feedbackId: null,
    },
    { where: { feedbackId: feedback.id } },
  )
})

module.exports = Feedback
