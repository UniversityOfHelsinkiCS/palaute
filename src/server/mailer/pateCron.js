const cron = require('node-cron')
const { inProduction, inStaging } = require('../../config')
const logger = require('../util/logger')

const {
  sendEmailAboutSurveyOpeningToStudents,
  sendEmailReminderAboutSurveyOpeningToTeachers,
  sendEmailReminderAboutFeedbackResponseToTeachers,
  sendEmailContinuousFeedbackDigestToTeachers,
  sendAutomaticReminderOnFeedbackToStudents,
} = require('./mails')

const schedule = (cronTime, job) => {
  cron.schedule(cronTime, job, {
    scheduled: true,
    timezone: 'Europe/Helsinki',
  })
}

const run = async () => {
  logger.info('Running pate cron')
  await sendEmailAboutSurveyOpeningToStudents()
  await sendEmailReminderAboutSurveyOpeningToTeachers()
  await sendEmailReminderAboutFeedbackResponseToTeachers()
  await sendEmailContinuousFeedbackDigestToTeachers()
  await sendAutomaticReminderOnFeedbackToStudents()
}

const start = async () => {
  // run()
  if (!inProduction || inStaging) {
    return logger.info('Not running Pate if not in production')
  }
  logger.info('Setup pate cron')
  const cronTime = '15 11 * * *' // Daily at 11:15

  return schedule(cronTime, run)
}

module.exports = {
  start,
  run,
}
