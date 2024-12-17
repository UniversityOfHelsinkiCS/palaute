const { inProduction, inStaging, SEND_STUDENT_AUTOMATIC_REMINDER_ENABLED } = require('../util/config')
const { logger } = require('../util/logger')
const { schedule } = require('../util/cron/schedule')

const {
  sendEmailAboutSurveyOpeningToStudents,
  sendEmailReminderAboutSurveyOpeningToTeachers,
  sendEmailReminderAboutFeedbackResponseToTeachers,
  sendAutomaticReminderOnFeedbackToStudents,
  sendEmailContinuousFeedbackDigestToTeachers,
} = require('./mails')

const runContinuousFeedbackCron = async () => {
  logger.info('Running continuous feedback digest cron')
  await sendEmailContinuousFeedbackDigestToTeachers()
}

const startContinuousFeedbackCron = async () => {
  if (!inProduction || inStaging) {
    return logger.info('Not running continuous feedback cron if not in production')
  }
  logger.info('Setup continuous feedback cron')
  const cronTime = '0 8 * * *' // Daily at 8:00

  return schedule(cronTime, runContinuousFeedbackCron)
}

const runPateCron = async () => {
  logger.info('Running pate cron')
  await sendEmailAboutSurveyOpeningToStudents()
  await sendEmailReminderAboutSurveyOpeningToTeachers()
  await sendEmailReminderAboutFeedbackResponseToTeachers()
  if (SEND_STUDENT_AUTOMATIC_REMINDER_ENABLED) {
    await sendAutomaticReminderOnFeedbackToStudents()
  }
}

const startPateCron = async () => {
  // run()
  if (!inProduction || inStaging) {
    return logger.info('Not running Pate if not in production')
  }
  logger.info('Setup pate cron')
  const cronTime = '15 11 * * *' // Daily at 11:15

  return schedule(cronTime, runPateCron)
}

const scheduleCronJobs = async () => {
  await startPateCron()
  await startContinuousFeedbackCron()
}

module.exports = {
  scheduleCronJobs,
  runPateCron,
  runContinuousFeedbackCron,
}
