const cron = require('node-cron')

const schedule = (cronTime, job) => {
  cron.schedule(cronTime, job, {
    scheduled: true,
    timezone: 'Europe/Helsinki',
  })
}

module.exports = {
  schedule,
}
