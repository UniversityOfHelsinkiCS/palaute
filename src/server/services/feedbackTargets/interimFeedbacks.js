const { v4: uuidv4 } = require('uuid')
const { ApplicationError } = require('../../util/customErrors')

const { getFeedbackTargetContext } = require('./getFeedbackTargetContext')

const { formatActivityPeriod } = require('../../util/common')
const { User, UserFeedbackTarget, FeedbackTarget, CourseRealisation, CourseUnit } = require('../../models')

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

const getInterimFeedbackTargets = async (parentId, user) => {
  const { access, feedbackTarget: parentFbt } = await getFeedbackTargetContext({
    feedbackTargetId: parentId,
    user,
  })

  if (!access?.canSeePublicFeedbacks()) ApplicationError.Forbidden()

  if (!parentFbt) throw new Error('Parent feedback target not found')

  const interimFeedbacks = await FeedbackTarget.findAll({
    attributes: [
      'id',
      'courseUnitId',
      'courseRealisationId',
      'name',
      'hidden',
      'feedbackType',
      'publicQuestionIds',
      'feedbackCount',
      'feedbackResponse',
      'feedbackResponseEmailSent',
      'opensAt',
      'closesAt',
    ],
    include: [
      {
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
      },
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
      },
      {
        model: UserFeedbackTarget,
        attributes: ['id'],
        as: 'students',
        required: false,
        where: { accessStatus: 'STUDENT' },
        include: {
          model: User,
          attributes: ['studentNumber'],
          as: 'user',
        },
      },
      {
        model: UserFeedbackTarget,
        attributes: ['id', 'userId', 'accessStatus'],
        as: 'userFeedbackTargets',
        required: false,
        where: {
          accessStatus: 'RESPONSIBLE_TEACHER',
        },
        include: {
          model: User,
          as: 'user',
        },
      },
    ],
    where: {
      courseUnitId: parentFbt.courseUnitId,
      courseRealisationId: parentFbt.courseRealisationId,
      userCreated: true,
    },
    order: [['courseRealisation', 'endDate', 'DESC']],
  })

  return interimFeedbacks
}

const createInterimFeedbackTarget = async (parentId, user, feedbackTargetData) => {
  const { name } = feedbackTargetData
  const { startDate, endDate } = formatActivityPeriod(feedbackTargetData)

  const { access, feedbackTarget: parentFbt } = await getFeedbackTargetContext({
    feedbackTargetId: parentId,
    user,
  })

  if (!access?.canCreateInterimFeedback()) ApplicationError.Forbidden()

  if (!parentFbt) throw new Error('Parent feedback target not found')

  const interimFeedbackTarget = await FeedbackTarget.create({
    feedbackType: 'courseRealisation',
    typeId: uuidv4(),
    courseUnitId: parentFbt.courseUnitId,
    courseRealisationId: parentFbt.courseRealisationId,
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
  getInterimFeedbackTargets,
  createUserFeedbackTargets,
  createInterimFeedbackTarget,
}
