const { CronJob } = require('cron')
const Sentry = require('@sentry/node')
const { inProduction, inStaging } = require('../util/config')
const logger = require('../util/logger')
const updateUsers = require('./updateUsers')
const updateOrganisations = require('./updateOrganisations')
const updateCoursesAndTeacherFeedbackTargets = require('./updateCoursesAndTeacherFeedbackTargets')
const {
  updateStudentFeedbackTargets,
} = require('./updateStudentFeedbackTargets')
const { UpdaterStatus } = require('../models')

const checkStatusOnStartup = async () => {
  const status = await UpdaterStatus.findOne()
  if (!status) return
  if (status.status === 'RUNNING') {
    status.status = 'FAILURE'
    status.finished_at = new Date()
    await status.save()
    const msg =
      'Server had a restart while updater was running, resulting in FAILURE!'
    Sentry.captureMessage(msg)
    logger.error(`[UPDATER] ${msg}`)
  }
}

const runUpdater = async () => {
  // Dependencies between updating, may result in failure if order not kept
  await updateUsers()
  await updateOrganisations()
  await updateCoursesAndTeacherFeedbackTargets()
  await updateStudentFeedbackTargets()
}

const run = async () => {
  logger.info('[UPDATER] Running updater')

  const [status] = await UpdaterStatus.findOrCreate({ where: { id: 1 } })
  status.started_at = new Date()
  status.finished_at = null
  status.status = 'RUNNING'
  await status.save()

  try {
    await runUpdater()
  } catch (error) {
    Sentry.captureException(error)
    status.status = 'FAILURE'
    status.finished_at = new Date()
    await status.save()
    return logger.error('[UPDATER] finished with error', error)
  }

  status.status = 'IDLE'
  status.finished_at = new Date()
  await status.save()

  return logger.info('[UPDATER] Finished updating')
}

const schedule = (cronTime, func) =>
  new CronJob({
    cronTime,
    onTick: func,
    start: true,
    timeZone: 'Europe/Helsinki',
  })

/* eslint-disable */
const start = async () => {
  if (!inProduction || inStaging) {
    return logger.info('Not running updater outside production')
  }
  logger.info('Setup cron job')
  const cronTime = '30 1 * * *' // Every night at 01:30 in production
  schedule(cronTime, run)

  logger.info('Running updater according to cron', { cron: cronTime })
}
/* eslint-enable */

module.exports = {
  start,
  run,
  checkStatusOnStartup,
}
