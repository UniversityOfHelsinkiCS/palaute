const {
  sendFeedbackReminderToStudents,
  sendFeedbackSummaryReminderToStudents,
  sendEmailReminderOnFeedbackToStudents,
  sendEmailReminderAboutFeedbackResponseToTeachers,
  sendEmailReminderAboutSurveyOpeningToTeachers,
  sendEmailAboutSurveyOpeningToStudents,
} = require('./mails')

const { returnEmailsToBeSentToday } = require('./stats')

const mailer = {
  sendEmailAboutSurveyOpeningToStudents,
  sendEmailReminderAboutSurveyOpeningToTeachers,
  sendEmailReminderAboutFeedbackResponseToTeachers,
  sendEmailReminderOnFeedbackToStudents,
  sendFeedbackSummaryReminderToStudents,
  sendFeedbackReminderToStudents,
  returnEmailsToBeSentToday,
}

module.exports = { mailer }
