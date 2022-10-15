const { Op } = require('sequelize')
const { subHours } = require('date-fns')

const { sequelize } = require('../util/dbConnection')
const { FeedbackTarget, UserFeedbackTarget } = require('../models')
const logger = require('../util/logger')
const mangleData = require('./updateLooper')
const importerClient = require('./importerClient')
const {
  notifyOnEnrolmentsIfRequested,
} = require('../services/enrolmentNotices/enrolmentNotices')

const createEnrolmentTargets = async (enrolment) => {
  const {
    personId: userId,
    courseUnitRealisationId,
    studySubGroups,
  } = enrolment

  const subGroupIds = studySubGroups.map((group) => group.studySubGroupId)
  const subGroupFeedbackTargets = await FeedbackTarget.findAll({
    where: {
      [Op.or]: [
        {
          feedbackType: 'studySubGroup',
          typeId: {
            [Op.in]: subGroupIds,
          },
        },
        {
          feedbackType: 'courseRealisation',
          typeId: courseUnitRealisationId,
        },
      ],
    },
  })
  const subGroupTargets = subGroupFeedbackTargets.map((feedbackTarget) => ({
    accessStatus: 'STUDENT',
    userId,
    feedbackTargetId: feedbackTarget.id,
  }))
  return subGroupTargets
}

const enrolmentsHandler = async (enrolments) => {
  const userFeedbackTargets = []
  const newUfbts = []
  await enrolments.reduce(async (promise, enrolment) => {
    await promise
    userFeedbackTargets.push(...(await createEnrolmentTargets(enrolment)))
  }, Promise.resolve())

  for (const ufbt of userFeedbackTargets) {
    const { userId, feedbackTargetId, accessStatus } = ufbt
    try {
      const [it, created] = await UserFeedbackTarget.findOrCreate({
        where: {
          userId,
          feedbackTargetId,
        },
        defaults: {
          user_id: userId,
          feedback_target_id: feedbackTargetId,
          accessStatus,
        },
      })

      if (created) newUfbts.push(it)
    } catch (err) {
      if (err.name === 'SequelizeForeignKeyConstraintError') {
        logger.info('[UPDATER] got enrolment of unknown user')
      } else {
        logger.error(`[UPDATER] error: ${err.message}`)
      }
    }
  }

  // not super important, lets not await for this. Also it makes pate requests which may be slow
  notifyOnEnrolmentsIfRequested(newUfbts)
  return newUfbts.length
}

const updateStudentFeedbackTargets = async () => {
  // Delete all old enrolments once a week sunday-monday night.
  // Delete only enrollments, not teacher relations
  if (new Date().getDay() === 1) {
    logger.info('[UPDATER] Deleting old enrolments', {})
    await sequelize.query(
      `DELETE FROM user_feedback_targets WHERE feedback_id IS NULL
       AND access_status = 'STUDENT'
       AND feedback_open_email_sent = false`,
    )
  }

  await mangleData('enrolments', 3000, enrolmentsHandler)
}

const updateEnrolmentsOfCourse = async (courseRealisationId) => {
  const start = Date.now()
  try {
    const { data: enrolments } = await importerClient.get(
      `palaute/updater/enrolments/${courseRealisationId}`,
    )
    await enrolmentsHandler(enrolments)
    const end = Date.now()
    logger.info(
      `[UPDATER] updated enrolments of ${courseRealisationId} (${
        enrolments.length
      }) - ${(end - start).toFixed(0)} ms`,
    )
    return 1
  } catch (error) {
    logger.error(`[UPDATER] error ${error}`)
    const end = Date.now()
    logger.info(
      `[UPDATER] failed to update enrolments of ${courseRealisationId} - ${(
        end - start
      ).toFixed(0)} ms`,
    )
    return 0
  }
}

const updateNewEnrolments = async () => {
  const start = new Date()
  const hourAgo = subHours(start, 1)
  try {
    const { data: enrolments } = await importerClient.get(
      `palaute/updater/enrolments-new?since=${hourAgo}`,
    )
    const count = await enrolmentsHandler(enrolments)
    const end = Date.now()
    logger.info(
      `[UPDATER] updated new enrolments (${
        enrolments.length
      } enrolments, ${count} new user feedback targets) - ${(
        end - start
      ).toFixed(0)} ms`,
    )
    return 1
  } catch (error) {
    logger.error(`[UPDATER] error ${error}`)
    const end = Date.now()
    logger.info(
      `[UPDATER] failed to update new enrolments - ${(end - start).toFixed(
        0,
      )} ms`,
    )
    return 0
  }
}

module.exports = {
  updateStudentFeedbackTargets,
  updateEnrolmentsOfCourse,
  updateNewEnrolments,
}
