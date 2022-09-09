const {
  sendFeedbackSummaryReminderToStudents,
} = require('./sendFeedbackReminderToStudents')
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
  sendEmailReminderAboutSurveyOpeningToTeachers,
} = require('./sendEmailReminderAboutSurveyOpeningToTeachers')
const {
  sendEmailAboutSurveyOpeningToStudents,
} = require('./sendEmailAboutSurveyOpeningToStudents')

module.exports = {
  sendFeedbackReminderToStudents,
  sendFeedbackSummaryReminderToStudents,
  sendAutomaticReminderOnFeedbackToStudents,
  sendEmailReminderAboutFeedbackResponseToTeachers,
  sendEmailReminderAboutSurveyOpeningToTeachers,
  sendEmailAboutSurveyOpeningToStudents,
}
