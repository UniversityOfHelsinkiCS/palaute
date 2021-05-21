const { Op } = require('sequelize')
const { FeedbackTarget, UserFeedbackTarget } = require('../models')
const logger = require('../util/logger')
const mangleData = require('./updateLooper')

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
  await enrolments.reduce(async (promise, enrolment) => {
    await promise
    try {
      userFeedbackTargets.push(...(await createEnrolmentTargets(enrolment)))
    } catch (err) {
      logger.info('ERR', { err, enrolment })
    }
  }, Promise.resolve())
  await UserFeedbackTarget.bulkCreate(userFeedbackTargets, {
    ignoreDuplicates: true,
  })
}

const updateStudentFeedbackTargets = async () => {
  await mangleData('enrolments', 500, enrolmentsHandler)
}

module.exports = updateStudentFeedbackTargets
