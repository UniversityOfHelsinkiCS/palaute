const { inProduction, inStaging } = require('../../config')
const logger = require('../util/logger')
const { schedule } = require('../util/cron')

const { sendEmailContinuousFeedbackDigestToTeachers } = require('./mails')

const run = async () => {
  logger.info('Running continuous feedback digest cron')
  await sendEmailContinuousFeedbackDigestToTeachers()
}

const start = async () => {
  if (!inProduction || inStaging) {
    return logger.info('Not running continuous feedback cron if not in production')
  }
  logger.info('Setup continuous feedback cron')
  const cronTime = '0 8 * * *' // Daily at 8:00

  return schedule(cronTime, run)
}

module.exports = {
  start,
  run,
}
