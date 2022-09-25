const {
  sendFeedbackReminderToStudents,
  sendFeedbackSummaryReminderToStudents,
  sendAutomaticReminderOnFeedbackToStudents,
  sendEmailReminderAboutFeedbackResponseToTeachers,
  sendEmailReminderAboutSurveyOpeningToTeachers,
  sendEmailAboutSurveyOpeningToStudents,
  sendEmailToStudentsWhenOpeningImmediately,
} = require('./mails')

const { returnEmailsToBeSentToday } = require('./mails/stats')

const { start: startCron, run: runCron } = require('./pateCron')

const mailer = {
  sendEmailAboutSurveyOpeningToStudents,
  sendEmailToStudentsWhenOpeningImmediately,
  sendEmailReminderAboutSurveyOpeningToTeachers,
  sendEmailReminderAboutFeedbackResponseToTeachers,
  sendAutomaticReminderOnFeedbackToStudents,
  sendFeedbackSummaryReminderToStudents,
  sendFeedbackReminderToStudents,
  returnEmailsToBeSentToday,
  startCron,
  runCron,
}

module.exports = { mailer }
