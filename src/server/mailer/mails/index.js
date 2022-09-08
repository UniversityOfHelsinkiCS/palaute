const {
  sendFeedbackSummaryReminderToStudents,
} = require('./sendFeedbackReminderToStudents')
const {
  sendFeedbackReminderToStudents,
} = require('./sendFeedbackReminderToStudents')
const {
  sendEmailReminderOnFeedbackToStudents,
} = require('./sendEmailReminderOnFeedbackToStudents')
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
  sendEmailReminderOnFeedbackToStudents,
  sendEmailReminderAboutFeedbackResponseToTeachers,
  sendEmailReminderAboutSurveyOpeningToTeachers,
  sendEmailAboutSurveyOpeningToStudents,
}
