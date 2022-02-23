const { CronJob } = require('cron')
const { inE2EMode } = require('../../config')
const { User } = require('../models')
const logger = require('./logger')
const courseSummaryController = require('../controllers/courseSummaryController')
const { redisClient } = require('./redisClient')

const schedule = (cronTime, func) =>
  new CronJob({
    cronTime,
    onTick: func,
    start: true,
    timeZone: 'Europe/Helsinki',
  })

const run = async () => {
  logger.info('Running OrganisationSummary caching cron')
  await redisClient.flushDb()
  const admin = await User.findOne({ where: { username: 'varisleo' } })
  courseSummaryController.getByOrganisations(
    {
      // req
      user: admin,
      query: { includeOpenUniCourseUnits: true },
    },
    {
      // res
      send: () => {},
    },
  )
}

const start = async () => {
  if (inE2EMode) {
    return logger.info('Not running cache cron in E2EMode')
  }
  const cronTime = '0 4 * * *' // 4 am
  run()
  return schedule(cronTime, run)
}

module.exports = {
  start,
  run,
}
