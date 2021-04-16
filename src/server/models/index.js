const AssessmentItem = require('./assessmentItem')
const Feedback = require('./feedback')
const User = require('./user')
const CourseRealisation = require('./courseRealisation')
const Question = require('./question')
const FeedbackTarget = require('./feedbackTarget')
const Survey = require('./survey')
const CourseUnit = require('./courseUnit')
const UserFeedbackTarget = require('./userFeedbackTarget')

FeedbackTarget.belongsTo(CourseUnit, {
  as: 'courseUnit',
})

FeedbackTarget.belongsTo(CourseRealisation, {
  foreignKey: 'courseRealisationId',
  as: 'courseRealisation',
})

UserFeedbackTarget.belongsTo(FeedbackTarget, { as: 'feedbackTarget' })

UserFeedbackTarget.belongsTo(Feedback, {
  as: 'feedback',
})

module.exports = {
  AssessmentItem,
  Feedback,
  User,
  CourseRealisation,
  Question,
  FeedbackTarget,
  Survey,
  CourseUnit,
  UserFeedbackTarget,
}
