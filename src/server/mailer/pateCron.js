const { CronJob } = require('cron')
const { inProduction, inStaging } = require('../../config')
const logger = require('../util/logger')

const { mailer } = require('.')

const schedule = (cronTime, func) =>
  new CronJob({
    cronTime,
    onTick: func,
    start: true,
    timeZone: 'Europe/Helsinki',
  })

const run = async () => {
  logger.info('Running pate cron')
  await mailer.sendEmailAboutSurveyOpeningToStudents()
  await mailer.sendEmailReminderAboutSurveyOpeningToTeachers()
  await mailer.sendEmailReminderAboutFeedbackResponseToTeachers()
  await mailer.sendAutomaticReminderOnFeedbackToStudents()
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
