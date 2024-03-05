const { inProduction } = require('../config')
const { schedule } = require('./schedule')
const { buildSummaries } = require('../../services/summary/buildSummaries')

const run = async () => {
  console.time('Build summaries')
  await buildSummaries()
  console.timeEnd('Build summaries')
}

const start = () => {
  const cronTime = '20 5 * * *' // 5:20 am

  if (inProduction) {
    schedule(cronTime, run)
  }
}

module.exports = {
  start,
  run,
}
