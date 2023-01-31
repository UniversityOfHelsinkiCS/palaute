const { inProduction, inStaging } = require('../../config')
const updateNewEnrolmentsJob = require('../updater/updateNewEnrolmentsJob')
const logger = require('./logger')
const { schedule } = require('./cron')

const run = async () => {
  await updateNewEnrolmentsJob()
}

const start = async () => {
  const cronTime = '0 * * * *'
  // run()
  if (!inProduction || inStaging) {
    return logger.info('Not running enrolments updater outside production')
  }
  return schedule(cronTime, run)
}

module.exports = {
  start,
  run,
}
