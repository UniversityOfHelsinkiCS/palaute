const { Op } = require('sequelize')
const { STRING, INTEGER, Model, BOOLEAN } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

class UserFeedbackTarget extends Model {
  hasTeacherAccess() {
    return this.accessStatus === 'RESPONSIBLE_TEACHER' || this.accessStatus === 'TEACHER'
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
    groupIds: Array(INTEGER),
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
    isAdministrativePerson: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    userCreated: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    notGivingFeedback: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    underscored: true,
    sequelize,

    scopes: {
      students: {
        where: {
          accessStatus: 'STUDENT',
        },
      },
      teachers: {
        where: {
          accessStatus: { [Op.in]: ['RESPONSIBLE_TEACHER', 'TEACHER'] },
        },
      },
    },
  }
)

module.exports = UserFeedbackTarget
