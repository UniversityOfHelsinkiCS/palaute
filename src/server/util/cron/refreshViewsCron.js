const { inE2EMode, inProduction } = require('../config')
const { schedule } = require('./schedule')
const { runRefreshViewsQuery } = require('../../services/summary/sql')

const run = async () => {
  console.time('Refresh views')
  await runRefreshViewsQuery()
  console.timeEnd('Refresh views')
}

const start = async () => {
  const cronTime = '30 6 * * *' // 6:30 am
  if (inE2EMode || inProduction) run()
  return schedule(cronTime, run)
}

module.exports = {
  start,
  run,
}
