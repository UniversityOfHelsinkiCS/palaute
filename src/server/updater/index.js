const { CronJob } = require('cron')
const { inProduction } = require('../util/config')
const logger = require('../util/logger')
const updateUsers = require('./updateUsers')
const updateOrganisations = require('./updateOrganisations')
const updateCoursesAndTeacherFeedbackTargets = require('./updateCoursesAndTeacherFeedbackTargets')
const updateStudentFeedbackTargets = require('./updateStudentFeedbackTargets')

const schedule = (cronTime, func) =>
  new CronJob({
    cronTime,
    onTick: func,
    start: true,
    timeZone: 'Europe/Helsinki',
  })

const run = async () => {
  logger.info('Running updater')
  // Dependencies between updating, may result in failure if order not kept
  await updateUsers()
  await updateOrganisations()
  await updateCoursesAndTeacherFeedbackTargets()
  await updateStudentFeedbackTargets()
}

const start = async () => {
  if (!inProduction) {
    return
  }
  logger.info('Setup cron job')
  const cronTime = inProduction
    ? '30 5 * * *' // Every night at 05:30 in production
    : '*/30 * * * *' // Every 30 minutes in development
  schedule(cronTime, run)

  return logger.info('Running updater according to cron', { cron: cronTime })
}

module.exports = {
  start,
}
