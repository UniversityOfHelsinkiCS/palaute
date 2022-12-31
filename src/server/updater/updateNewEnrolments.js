const Sentry = require('@sentry/node')
const { UpdaterStatus } = require('../models')
const logger = require('../util/logger')
const { updateNewEnrolments } = require('./updateStudentFeedbackTargets')

const updateNewEnrolmentsJob = async () => {
  const running = await UpdaterStatus.findAll({
    where: { status: 'RUNNING' },
  })
  if (running?.length > 0) {
    logger.error(`[UPDATER] enrolments updating skipped because another job was running`)
    return
  }
  const status = await UpdaterStatus.create({
    status: 'RUNNING',
    jobType: 'ENROLMENTS',
  })
  try {
    await updateNewEnrolments()
    status.status = 'FINISHED'
    status.finishedAt = new Date()
    await status.save()
  } catch (error) {
    Sentry.captureException(error)
    Sentry.captureMessage(`${status.jobType} Updater run failed!`)
    status.status = 'FAILURE'
    status.finishedAt = new Date()
    await status.save()
    logger.error(`[UPDATER] ${status.jobType} finished with error`, error)
  }
}

module.exports = updateNewEnrolmentsJob
