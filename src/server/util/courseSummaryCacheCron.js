const { CronJob } = require('cron')
const { inE2EMode, inProduction } = require('../../config')
const {
  getAllRowsFromDb,
} = require('../routes/courseSummary/getOrganisationSummaries')
const { cacheSummary } = require('./courseSummaryCache')
const logger = require('./logger')

const schedule = (cronTime, func) =>
  new CronJob({
    cronTime,
    onTick: func,
    start: true,
    timeZone: 'Europe/Helsinki',
  })

const run = async () => {
  logger.info('Running OrganisationSummary caching cron')
  const rows = await getAllRowsFromDb()
  await cacheSummary(rows)
}

const start = async () => {
  const cronTime = '30 6 * * *' // 4 am
  if (inE2EMode || inProduction) run()
  // run()
  return schedule(cronTime, run)
}

module.exports = {
  start,
  run,
}
