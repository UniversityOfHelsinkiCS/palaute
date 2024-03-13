const { CRON_DISABLED } = require('../config')
const logger = require('../logger')
const { mailer } = require('../../mailer')
const { start: startPrecacheFeedbackTargetsCron } = require('./precacheFeedbackTargetsCron')
const { start: startSummariesCron } = require('./summariesCron')

const scheduleCronJobs = async () => {
  if (CRON_DISABLED) {
    logger.info('Not scheduling cron jobs because CRON_DISABLED is set to true')
    return
  }

  startSummariesCron()
  await startPrecacheFeedbackTargetsCron()
  await mailer.scheduleCronJobs()

  logger.info('Cron jobs scheduled')
}

module.exports = {
  scheduleCronJobs,
}
