const {
  sendFeedbackSummaryReminderToStudents,
} = require('./sendFeedbackSummaryReminderToStudents')
const {
  sendFeedbackReminderToStudents,
} = require('./sendFeedbackReminderToStudents')
const {
  sendAutomaticReminderOnFeedbackToStudents,
} = require('./sendAutomaticReminderOnFeedbackToStudents')
const {
  sendEmailReminderAboutFeedbackResponseToTeachers,
} = require('./sendEmailReminderAboutFeedbackResponseToTeacher')
const {
  sendEmailToStudentsWhenOpeningImmediately,
} = require('./sendEmailToStudentsWhenOpeningImmediately')
const {
  sendEmailReminderAboutSurveyOpeningToTeachers,
} = require('./sendEmailReminderAboutSurveyOpeningToTeachers')
const {
  sendEmailAboutSurveyOpeningToStudents,
} = require('./sendEmailAboutSurveyOpeningToStudents')
const {
  sendEmailContinuousFeedbackDigestToTeachers,
} = require('./sendEmailContinuousFeedbackDigestToTeachers')
const {
  sendEmailContinuousFeedbackResponsesToStudents,
} = require('./sendContinuousFeedbackResponsesToStudents')
const {
  sendEmailNotificationAboutEnrolments,
} = require('./sendEmailNotificationAboutEnrolments')

module.exports = {
  sendFeedbackReminderToStudents,
  sendFeedbackSummaryReminderToStudents,
  sendEmailToStudentsWhenOpeningImmediately,
  sendAutomaticReminderOnFeedbackToStudents,
  sendEmailReminderAboutFeedbackResponseToTeachers,
  sendEmailReminderAboutSurveyOpeningToTeachers,
  sendEmailAboutSurveyOpeningToStudents,
  sendEmailContinuousFeedbackDigestToTeachers,
  sendEmailContinuousFeedbackResponsesToStudents,
  sendEmailNotificationAboutEnrolments,
}
