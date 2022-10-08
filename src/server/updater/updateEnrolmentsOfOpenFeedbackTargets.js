const { Op } = require('sequelize')
const Sentry = require('@sentry/node')
const { FeedbackTarget, UpdaterStatus } = require('../models')
const { sequelize } = require('../util/dbConnection')
const logger = require('../util/logger')
const { updateEnrolmentsOfCourse } = require('./updateStudentFeedbackTargets')

const updateEnrolmentsOfOpenFeedbackTargets = async () => {
  const status = await UpdaterStatus.create({
    status: 'RUNNING',
    jobType: 'ENROLMENTS',
  })
  try {
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((resolve) => setTimeout(resolve, 10000))
    const now = new Date()
    const openFeedbackTargets = await FeedbackTarget.findAll({
      attributes: [
        [
          sequelize.fn('DISTINCT', sequelize.col('course_realisation_id')),
          'courseRealisationId',
        ],
      ],
      where: {
        opensAt: {
          [Op.lt]: now,
        },
        closesAt: {
          [Op.gt]: now,
        },
        hidden: false,
      },
    })
    logger.info(
      `[UPDATER] starting to update enrolments of ${openFeedbackTargets.length} open feedback targets`,
    )
    let successCount = 0
    for (const fbt of openFeedbackTargets) {
      successCount += await updateEnrolmentsOfCourse(fbt.courseRealisationId)
    }
    logger.info(
      `[UPDATER] done, updated enrolments of ${successCount}/${
        openFeedbackTargets.length
      } courses in ${(new Date() - now).toFixed(0)} ms`,
    )
    status.status = 'FINISHED'
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

module.exports = updateEnrolmentsOfOpenFeedbackTargets
