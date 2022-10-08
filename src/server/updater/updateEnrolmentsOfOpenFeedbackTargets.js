const { Op } = require('sequelize')
const { FeedbackTarget } = require('../models')
const { sequelize } = require('../util/dbConnection')
const logger = require('../util/logger')
const { updateEnrolmentsOfCourse } = require('./updateStudentFeedbackTargets')

const updateEnrolmentsOfOpenFeedbackTargets = async () => {
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
}

module.exports = updateEnrolmentsOfOpenFeedbackTargets
