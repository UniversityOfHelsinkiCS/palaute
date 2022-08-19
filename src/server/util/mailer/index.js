const {
  sendEmailAboutSurveyOpeningToStudents,
  sendEmailReminderAboutSurveyOpeningToTeachers,
  sendEmailReminderAboutFeedbackResponseToTeachers,
  sendEmailReminderOnFeedbackToStudents,
  sendFeedbackSummaryReminderToStudents,
  sendFeedbackReminderToStudents,
  returnEmailsToBeSentToday,
} = require('./emailSender')

const {
  sendNotificationAboutFeedbackResponseToStudents,
  sendReminderToGiveFeedbackToStudents,
} = require('./pate')

const mailer = {
  sendEmailAboutSurveyOpeningToStudents,
  sendEmailReminderAboutSurveyOpeningToTeachers,
  sendEmailReminderAboutFeedbackResponseToTeachers,
  sendEmailReminderOnFeedbackToStudents,
  sendNotificationAboutFeedbackResponseToStudents,
  sendReminderToGiveFeedbackToStudents,
  sendFeedbackSummaryReminderToStudents,
  sendFeedbackReminderToStudents,
  returnEmailsToBeSentToday,
}

module.exports = { mailer }
