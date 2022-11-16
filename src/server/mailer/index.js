const {
  sendFeedbackReminderToStudents,
  sendFeedbackSummaryReminderToStudents,
  sendAutomaticReminderOnFeedbackToStudents,
  sendEmailReminderAboutFeedbackResponseToTeachers,
  sendEmailReminderAboutSurveyOpeningToTeachers,
  sendEmailAboutSurveyOpeningToStudents,
  sendEmailToStudentsWhenOpeningImmediately,
  sendEmailContinuousFeedbackResponsesToStudents,
  sendEmailNotificationAboutEnrolments,
} = require('./mails')

const { returnEmailsToBeSentToday } = require('./mails/stats')

const {
  start: startContinuousFeedbackCron,
} = require('./continuousFeedbackCron')

const { start: startCron, run: runCron } = require('./pateCron')

const mailer = {
  sendEmailAboutSurveyOpeningToStudents,
  sendEmailToStudentsWhenOpeningImmediately,
  sendEmailReminderAboutSurveyOpeningToTeachers,
  sendEmailReminderAboutFeedbackResponseToTeachers,
  sendEmailContinuousFeedbackResponsesToStudents,
  sendAutomaticReminderOnFeedbackToStudents,
  sendFeedbackSummaryReminderToStudents,
  sendEmailNotificationAboutEnrolments,
  sendFeedbackReminderToStudents,
  returnEmailsToBeSentToday,
  startContinuousFeedbackCron,
  startCron,
  runCron,
}

module.exports = { mailer }
