const { STRING, INTEGER, Model, BOOLEAN } = require('sequelize')
const { sequelize } = require('../util/dbConnection')

class UserFeedbackTarget extends Model {
  hasTeacherAccess() {
    return this.accessStatus === 'RESPONSIBLE_TEACHER'
  }

  hasStudentAccess() {
    return this.accessStatus === 'STUDENT'
  }
}

UserFeedbackTarget.init(
  {
    id: {
      primaryKey: true,
      type: INTEGER,
      allowNull: false,
      autoIncrement: true,
    },
    accessStatus: {
      type: STRING,
      allowNull: false,
    },
    feedbackId: INTEGER,
    userId: {
      type: STRING,
      allowNull: false,
    },
    feedbackTargetId: {
      type: INTEGER,
      allowNull: false,
    },
    feedbackOpenEmailSent: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = UserFeedbackTarget
