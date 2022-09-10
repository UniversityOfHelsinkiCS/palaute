const { CronJob } = require('cron')
const { inE2EMode, inProduction } = require('../../config')
const { REFRESH_VIEWS_QUERY } = require('../services/summary')
const { sequelize } = require('./dbConnection')

const schedule = (cronTime, func) =>
  new CronJob({
    cronTime,
    onTick: func,
    start: true,
    timeZone: 'Europe/Helsinki',
  })

const run = async () => {
  console.time('Refresh views')
  await sequelize.query(REFRESH_VIEWS_QUERY)
  console.timeEnd('Refresh views')
}

const start = async () => {
  const cronTime = '30 6 * * *' // 6:30 am
  if (inE2EMode || inProduction) run()
  // run()
  return schedule(cronTime, run)
}

module.exports = {
  start,
  run,
}