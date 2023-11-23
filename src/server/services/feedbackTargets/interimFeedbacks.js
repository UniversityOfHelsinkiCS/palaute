const { Op } = require('sequelize')
const { v4: uuidv4 } = require('uuid')

const { formatActivityPeriod } = require('../../util/common')
const { UserFeedbackTarget, FeedbackTarget, CourseRealisation, CourseUnit } = require('../../models')

const getFbtUserIds = async (feedbackTargetId, accessStatus) => {
  const users = await UserFeedbackTarget.findAll({
    attributes: ['userId'],
    where: {
      feedbackTargetId,
      accessStatus,
    },
  })

  const userIds = users.map(({ userId }) => userId)

  return userIds
}

const createUserFeedbackTargets = async (feedbackTargetId, userIds, accessStatus) => {
  const userFeedbackTargets = await UserFeedbackTarget.bulkCreate(
    userIds.map(userId => ({
      accessStatus,
      feedbackTargetId,
      userId,
      isAdministrativePerson: accessStatus === 'RESPONSIBLE_TEACHER',
      userCreated: true,
    }))
  )

  return userFeedbackTargets
}

const getInterimFeedbackById = async feedbackTargetId => {
  const interimFeedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId)

  if (!interimFeedbackTarget) throw new Error('Interim feedback target not found')

  return interimFeedbackTarget
}

const createInterimFeedbackTarget = async (parentId, feedbackTargetData) => {
  const { name } = feedbackTargetData
  const { startDate, endDate } = formatActivityPeriod(feedbackTargetData)

  const parentFbt = await FeedbackTarget.findByPk(parentId)

  if (!parentFbt) throw new Error('Parent feedback target not found')

  const parentCUR = await CourseRealisation.findByPk(parentFbt.courseRealisationId)

  if (!parentCUR) throw new Error('Parent fbt course unit realisation not found')

  const parentCU = await CourseUnit.findByPk(parentFbt.courseUnitId)

  if (!parentCU) throw new Error('Parent fbt course unit not found')

  const interimFeedbackTarget = await FeedbackTarget.create({
    feedbackType: 'courseRealisation',
    typeId: uuidv4(),
    courseUnitId: parentCU.id,
    courseRealisationId: parentCUR.id,
    name,
    hidden: false,
    opensAt: startDate,
    closesAt: endDate,
    userCreated: true,
  })

  return interimFeedbackTarget
}

module.exports = {
  getFbtUserIds,
  getInterimFeedbackById,
  createUserFeedbackTargets,
  createInterimFeedbackTarget,
}
