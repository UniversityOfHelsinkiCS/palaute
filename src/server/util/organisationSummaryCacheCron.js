const { CronJob } = require('cron')
const { inE2EMode, inProduction } = require('../../config')
const logger = require('./logger')
const {
  populateOrganisationSummaryCache,
} = require('./courseSummary/getOrganisationSummaries')

const schedule = (cronTime, func) =>
  new CronJob({
    cronTime,
    onTick: func,
    start: true,
    timeZone: 'Europe/Helsinki',
  })

const run = async () => {
  logger.info('Running OrganisationSummary caching cron')
  await populateOrganisationSummaryCache()
}

const start = async () => {
  const cronTime = '30 6 * * *' // 4 am
  if (inE2EMode || inProduction) run()
  return schedule(cronTime, run)
}

module.exports = {
  start,
  run,
}
