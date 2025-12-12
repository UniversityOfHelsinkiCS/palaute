import { v4 as uuidv4 } from 'uuid'
import { LocalizedString } from '@common/types/common'
import { sequelize } from '../../db/dbConnection'

import { getFeedbackTargetContext } from './getFeedbackTargetContext'

import {
  CourseUnit,
  CourseRealisation,
  FeedbackTarget,
  FeedbackTargetLog,
  UserFeedbackTarget,
  Survey,
  User,
  Summary,
} from '../../models'

import { logger } from '../../util/logger'
import { DateRangeInput, formatActivityPeriod } from '../../util/common'
import { ApplicationError } from '../../util/ApplicationError'
import { User as UserType } from '../../models/user'

const getInterimFeedbackParentFbt = async (interimFbtId: number | string, user: UserType) => {
  const { access, feedbackTarget: interimFeedbackTarget } = await getFeedbackTargetContext({
    feedbackTargetId: interimFbtId,
    user,
  })

  if (!access?.canSeePublicFeedbacks()) throw ApplicationError.Forbidden()

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

const createUserFeedbackTargets = async (
  parentFeedbackTargetId: number | string,
  interimFeedbackTargetId: number | string
) => {
  const parentUserFeedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      feedbackTargetId: parentFeedbackTargetId,
    },
    raw: true,
  })

  const userFeedbackTargets = await UserFeedbackTarget.bulkCreate(
    parentUserFeedbackTargets.map(({ accessStatus, userId, isAdministrativePerson, groupIds }) => ({
      accessStatus,
      userId,
      isAdministrativePerson,
      groupIds,
      feedbackTargetId: Number(interimFeedbackTargetId),
      userCreated: true,
    }))
  )

  return userFeedbackTargets
}

const getInterimFeedbackById = async (feedbackTargetId: number | string) => {
  const interimFeedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId)

  if (!interimFeedbackTarget) throw new Error('Interim feedback target not found')

  return interimFeedbackTarget
}

const getInterimFeedbackTargets = async (parentId: number | string, user: UserType) => {
  const { access, feedbackTarget: parentFbt } = await getFeedbackTargetContext({
    feedbackTargetId: parentId,
    user,
  })

  if (!access?.canSeePublicFeedbacks()) throw ApplicationError.Forbidden()

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
      'feedbackResponse',
      'feedbackResponseEmailSent',
      'opensAt',
      'closesAt',
    ],
    include: [
      {
        model: Summary,
        as: 'summary',
        required: false,
      },
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
        attributes: ['id', 'userId', 'accessStatus'],
        as: 'userFeedbackTargets',
        required: false,
        where: {
          accessStatus: 'RESPONSIBLE_TEACHER',
        },
        include: [
          {
            model: User,
            as: 'user',
          },
        ],
      },
    ],
    where: {
      courseUnitId: parentFbt.courseUnitId,
      courseRealisationId: parentFbt.courseRealisationId,
      userCreated: true,
    },
    order: [['closesAt', 'DESC']],
  })

  return interimFeedbacks
}

type InterimFeedbackTargetData = {
  name: LocalizedString
} & DateRangeInput

const createInterimFeedbackTarget = async (
  parentId: number | string,
  user: UserType,
  feedbackTargetData: InterimFeedbackTargetData
) => {
  const { name } = feedbackTargetData
  const { startDate, endDate } = formatActivityPeriod(feedbackTargetData)

  const { access, feedbackTarget: parentFbt } = await getFeedbackTargetContext({
    feedbackTargetId: parentId,
    user,
  })

  if (!access?.canCreateInterimFeedback()) throw ApplicationError.Forbidden()

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

const updateInterimFeedbackTarget = async (fbtId: number | string, user: UserType, updates: any) => {
  const { name } = updates

  const { access, feedbackTarget } = await getFeedbackTargetContext({
    feedbackTargetId: fbtId,
    user,
  })

  if (!access?.canCreateInterimFeedback()) throw ApplicationError.Forbidden()

  const { startDate, endDate } = formatActivityPeriod(updates) ?? (feedbackTarget as any)

  const updatedInterimFeedbackTarget = await feedbackTarget.update({
    name,
    opensAt: startDate,
    closesAt: endDate,
  })

  await Summary.update({ startDate, endDate }, { where: { feedbackTargetId: fbtId } })

  return updatedInterimFeedbackTarget
}

const removeInterimFeedbackTarget = async (fbtId: number | string, user: UserType) => {
  const t = await sequelize.transaction()

  const { access, feedbackTarget } = await getFeedbackTargetContext({
    feedbackTargetId: fbtId,
    user,
  })

  if (!access?.canCreateInterimFeedback()) throw ApplicationError.Forbidden()

  try {
    logger.info(`Deleting interim feedback ${feedbackTarget.id}`)

    await Summary.destroy({
      where: {
        feedbackTargetId: feedbackTarget.id,
      },
    })

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

    logger.info(`Deleted ${survey}`)

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

export {
  getInterimFeedbackParentFbt,
  getInterimFeedbackById,
  getInterimFeedbackTargets,
  createUserFeedbackTargets,
  createInterimFeedbackTarget,
  updateInterimFeedbackTarget,
  removeInterimFeedbackTarget,
}
