const { v4: uuidv4 } = require('uuid')
const { sequelize } = require('../../db/dbConnection')

const { getFeedbackTargetContext } = require('./getFeedbackTargetContext')

const {
  CourseUnit,
  CourseRealisation,
  FeedbackTarget,
  FeedbackTargetLog,
  UserFeedbackTarget,
  Survey,
  User,
} = require('../../models')

const logger = require('../../util/logger')
const { formatActivityPeriod } = require('../../util/common')
const { ApplicationError } = require('../../util/customErrors')

const getInterimFeedbackParentFbt = async (interimFbtId, user) => {
  const { access, feedbackTarget: interimFeedbackTarget } = await getFeedbackTargetContext({
    feedbackTargetId: interimFbtId,
    user,
  })

  if (!access?.canSeePublicFeedbacks()) ApplicationError.Forbidden()

  const parentFeedbackTarget = await FeedbackTarget.findOne({
    where: {
      courseUnitId: interimFeedbackTarget.courseUnitId,
      courseRealisationId: interimFeedbackTarget.courseRealisationId,
      userCreated: false,
    },
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
    ],
  })

  return parentFeedbackTarget
}

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

const getFbtAdministrativePersons = async feedbackTargetId => {
  const users = await UserFeedbackTarget.findAll({
    attributes: ['userId'],
    where: {
      feedbackTargetId,
      isAdministrativePerson: true,
    },
  })

  const userIds = users.map(({ userId }) => userId)

  return userIds
}

const createUserFeedbackTargets = async (feedbackTargetId, userIds, accessStatus, administrativePersons = []) => {
  const userFeedbackTargets = await UserFeedbackTarget.bulkCreate(
    userIds.map(userId => ({
      accessStatus,
      feedbackTargetId,
      userId,
      isAdministrativePerson: administrativePersons.includes(userId),
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

  if (parentFbt.userCreated)
    throw new Error('Creation of interim feedbacks prohibitet for user created feedback targets')

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

const updateInterimFeedbackTarget = async (fbtId, user, updates) => {
  const { name } = updates

  const { access, feedbackTarget } = await getFeedbackTargetContext({
    feedbackTargetId: fbtId,
    user,
  })

  if (!access?.canCreateInterimFeedback()) ApplicationError.Forbidden()

  const { startDate, endDate } = formatActivityPeriod(updates) ?? feedbackTarget

  const updatedInterimFeedbackTarget = await feedbackTarget.update({
    name,
    opensAt: startDate,
    closesAt: endDate,
  })

  return updatedInterimFeedbackTarget
}

const removeInterimFeedbackTarget = async (fbtId, user) => {
  const t = await sequelize.transaction()

  const { access, feedbackTarget } = await getFeedbackTargetContext({
    feedbackTargetId: fbtId,
    user,
  })

  if (!access?.canCreateInterimFeedback()) ApplicationError.Forbidden()

  try {
    logger.info(`Deleting organisation survey ${feedbackTarget.id}`)

    const ufbt = await UserFeedbackTarget.destroy({
      where: {
        feedbackTargetId: feedbackTarget.id,
      },
    })

    logger.info(`Deleted ${ufbt} user feedback targets`)

    const survey = await Survey.destroy({
      where: {
        feedbackTargetId: feedbackTarget.id,
      },
    })

    logger.info(`Deleted ${survey} surveys`)

    const log = await FeedbackTargetLog.destroy({
      where: {
        feedbackTargetId: feedbackTarget.id,
      },
    })

    logger.info(`Deleted ${log} feedback target logs`)

    const fbt = await FeedbackTarget.destroy({
      where: {
        id: feedbackTarget.id,
      },
    })

    logger.info(`Deleted ${fbt} feedback targets`)

    await t.commit()
  } catch (err) {
    await t.rollback()
    throw err
  }
}

module.exports = {
  getInterimFeedbackParentFbt,
  getFbtUserIds,
  getFbtAdministrativePersons,
  getInterimFeedbackById,
  getInterimFeedbackTargets,
  createUserFeedbackTargets,
  createInterimFeedbackTarget,
  updateInterimFeedbackTarget,
  removeInterimFeedbackTarget,
}
