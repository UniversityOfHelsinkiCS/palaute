const Sentry = require('@sentry/node')
const { inProduction, inStaging } = require('../util/config')
const logger = require('../util/logger')
const { schedule } = require('../util/cron')
const updateUsers = require('./updateUsers')
const updateOrganisations = require('./updateOrganisations')
const { updateCoursesAndTeacherFeedbackTargets } = require('./updateCoursesAndTeacherFeedbackTargets')
const { updateStudentFeedbackTargets } = require('./updateStudentFeedbackTargets')
const { updateFeedbackTargetCounts } = require('./updateFeedbackTargetCounts')
const { UpdaterStatus } = require('../models')

const JOB_TYPE = 'NIGHTLY'

const runUpdater = async () => {
  // Dependencies between updating, may result in failure if order not kept
  await updateUsers()
  await updateOrganisations()
  await updateCoursesAndTeacherFeedbackTargets()
  await updateStudentFeedbackTargets()
  await updateFeedbackTargetCounts()
}

const checkStatusOnStartup = async () => {
  const statuses = await UpdaterStatus.findAll({
    where: {
      status: 'RUNNING',
    },
  })

  for (const status of statuses) {
    status.status = 'INTERRUPTED'
    status.finishedAt = new Date()
    await status.save()
    const msg = `Server had a restart while updater was running, interrupting ${status.jobType}`
    Sentry.captureMessage(msg)
    logger.error(`[UPDATER] ${msg}`)
  }
}

const run = async () => {
  logger.info('[UPDATER] Running updater')

  const status = await UpdaterStatus.create({
    status: 'RUNNING',
    jobType: JOB_TYPE,
  })

  try {
    await runUpdater()
  } catch (error) {
    Sentry.captureException(error)
    Sentry.captureMessage('Updater run failed!')
    status.status = 'FAILURE'
    status.finishedAt = new Date()
    await status.save()
    return logger.error('[UPDATER] finished with error', error)
  }

  status.status = 'FINISHED'
  status.finishedAt = new Date()
  await status.save()

  return logger.info('[UPDATER] Finished updating')
}

const start = async () => {
  if (!inProduction || inStaging) {
    logger.info('Not running updater outside production')
    return
  }
  logger.info('Setup cron job')
  const cronTime = '30 1 * * *' // Every night at 01:30 in production
  schedule(cronTime, run)

  logger.info('Running updater according to cron', { cron: cronTime })
}

const updater = {
  start,
  run,
  checkStatusOnStartup,
}

module.exports = { updater }
