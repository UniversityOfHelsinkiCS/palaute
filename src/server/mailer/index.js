const {
  sendFeedbackReminderToStudents,
  sendFeedbackSummaryReminderToStudents,
  sendAutomaticReminderOnFeedbackToStudents,
  sendEmailReminderAboutFeedbackResponseToTeachers,
  sendEmailReminderAboutSurveyOpeningToTeachers,
  sendEmailAboutSurveyOpeningToStudents,
  sendEmailToStudentsWhenOpeningImmediately,
  sendEmailNotificationAboutEnrolments,
} = require('./mails')

const { returnEmailsToBeSentToday } = require('./mails/stats')

const { runContinuousFeedbackCron, runPateCron, scheduleCronJobs } = require('./scheduleCronJobs')

const mailer = {
  sendEmailAboutSurveyOpeningToStudents,
  sendEmailToStudentsWhenOpeningImmediately,
  sendEmailReminderAboutSurveyOpeningToTeachers,
  sendEmailReminderAboutFeedbackResponseToTeachers,
  sendAutomaticReminderOnFeedbackToStudents,
  sendFeedbackSummaryReminderToStudents,
  sendEmailNotificationAboutEnrolments,
  sendFeedbackReminderToStudents,
  returnEmailsToBeSentToday,
  runContinuousFeedbackCron,
  scheduleCronJobs,
  runPateCron,
}

module.exports = { mailer }
