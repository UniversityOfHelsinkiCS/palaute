const { FeedbackTarget, UserFeedbackTarget } = require('../models')
const logger = require('../util/logger')
const mangleData = require('./updateLooper')

const createEnrolmentTargets = async (enrolment) => {
  const feedbackTarget = await FeedbackTarget.findOne({
    where: {
      feedbackType: 'courseRealisation',
      typeId: enrolment.courseUnitRealisationId,
    },
  })
  if (!feedbackTarget) return
  const { personId: userId } = enrolment
  await UserFeedbackTarget.findOrCreate({
    where: {
      userId,
      feedbackTargetId: feedbackTarget.id,
    },
    defaults: {
      accessStatus: 'STUDENT',
      userId,
      feedbackTargetId: feedbackTarget.id,
    },
  })

  await enrolment.studySubGroups.reduce(async (promise, subGroup) => {
    await promise
    const subGroupFeedbackTarget = await FeedbackTarget.findOne({
      where: {
        feedbackType: 'studySubGroup',
        typeId: subGroup.studySubGroupId,
      },
    })
    if (!subGroupFeedbackTarget) return
    await UserFeedbackTarget.findOrCreate({
      where: {
        userId,
        feedbackTargetId: subGroupFeedbackTarget.id,
      },
      defaults: {
        accessStatus: 'STUDENT',
        userId,
        feedbackTargetId: subGroupFeedbackTarget.id,
      },
    })
  }, Promise.resolve())
}

const enrolmentHandler = async (enrolments) => {
  await enrolments.reduce(async (promise, enrolment) => {
    await promise
    try {
      await createEnrolmentTargets(enrolment)
    } catch (err) {
      logger.info('ERR', err, enrolment)
    }
  }, Promise.resolve())
}

const updateStudentFeedbackTargets = async () => {
  await mangleData('enrolments', 1000, enrolmentHandler)
}

module.exports = updateStudentFeedbackTargets
