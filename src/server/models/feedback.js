const { STRING } = require('sequelize')
const { Model, JSONB } = require('sequelize')
const { BOOLEAN } = require('sequelize')
const UserFeedbackTarget = require('./userFeedbackTarget')
const { sequelize } = require('../db/dbConnection')

class Feedback extends Model {
  toPublicObject() {
    return {
      id: this.id,
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
    degreeStudyRight: {
      type: BOOLEAN,
      allowNull: true,
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

Feedback.beforeDestroy(async feedback => {
  await UserFeedbackTarget.update(
    {
      feedbackId: null,
    },
    { where: { feedbackId: feedback.id } }
  )
})

module.exports = Feedback
