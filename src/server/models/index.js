const Feedback = require('./feedback')
const User = require('./user')
const CourseRealisation = require('./courseRealisation')
const FeedbackTarget = require('./feedbackTarget')
const Question = require('./question')
const Survey = require('./survey')
const CourseUnit = require('./courseUnit')
const UserFeedbackTarget = require('./userFeedbackTarget')
const Organisation = require('./organisation')
const CourseUnitsOrganisation = require('./courseUnitsOrganisation')

FeedbackTarget.belongsTo(CourseUnit, {
  as: 'courseUnit',
})

FeedbackTarget.belongsTo(CourseRealisation, {
  foreignKey: 'courseRealisationId',
  as: 'courseRealisation',
})

UserFeedbackTarget.belongsTo(FeedbackTarget, { as: 'feedbackTarget' })
FeedbackTarget.hasMany(UserFeedbackTarget, { as: 'userFeedbackTargets' })

UserFeedbackTarget.belongsTo(Feedback, {
  as: 'feedback',
})

UserFeedbackTarget.belongsTo(User, {
  as: 'user',
})
User.hasMany(UserFeedbackTarget, { as: 'userFeedbackTargets' })

Survey.belongsTo(CourseUnit, {
  as: 'courseUnit',
  foreignKey: 'typeId',
  targetKey: 'courseCode',
})

CourseUnit.belongsToMany(Organisation, {
  through: CourseUnitsOrganisation,
  as: 'organisations',
})

Organisation.belongsToMany(CourseUnit, {
  through: CourseUnitsOrganisation,
  as: 'courseUnits',
})

User.prototype.feedbackTargetsHasTeacherAccessTo = function () {
  return FeedbackTarget.findAll({
    include: {
      model: UserFeedbackTarget,
      as: 'userFeedbackTargets',
      where: {
        userId: this.id,
        accessStatus: 'TEACHER',
      },
      required: true,
    },
  })
}

module.exports = {
  Feedback,
  User,
  CourseRealisation,
  FeedbackTarget,
  Survey,
  CourseUnit,
  UserFeedbackTarget,
  Question,
  Organisation,
  CourseUnitsOrganisation,
}
