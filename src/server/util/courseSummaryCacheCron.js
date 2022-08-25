const { CronJob } = require('cron')
const { inE2EMode, inProduction } = require('../../config')
const {
  getAllRowsFromDb,
} = require('../routes/courseSummary/getOrganisationSummariesV2')
const { REFRESH_VIEWS_QUERY } = require('../routes/courseSummary/sql')
const { cacheSummary } = require('./courseSummaryCache')
const { sequelize } = require('./dbConnection')
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
  console.time('Refresh views')
  await sequelize.query(REFRESH_VIEWS_QUERY)
  console.timeEnd('Refresh views')
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
