const { CronJob } = require('cron')
const { inProduction } = require('../../config')
const logger = require('./logger')

const schedule = (cronTime, func) =>
  new CronJob({
    cronTime,
    onTick: func,
    start: true,
    timeZone: 'Europe/Helsinki',
  })

const run = async () => {
  logger.info('Running pate cron')
}

/* eslint-disable */
const start = async () => {
  if (!inProduction) {
    return logger.info('Not running Pate if not in production')
  }
  logger.info('Setup pate cron')

  const cronTime = '15 11 * * *' // Daily at 11:15

  return schedule(cronTime, run)
}
/* eslint-enable */

module.exports = {
  start,
  run,
}
