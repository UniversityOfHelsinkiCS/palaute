import type { Transaction } from 'sequelize'

import { sequelize } from '../../db/dbConnection'
import { Feedback, UserFeedbackTarget, FeedbackTarget } from '../../models'
import { FeedbackData } from '../../models/feedback'
import { User } from '../../models/user'
import { ApplicationError } from '../../util/ApplicationError'
import { removeOpenAnswers, setOpenAnswersHidden } from '../../util/openAnswers'
import feedbackTargetCache from './feedbackTargetCache'
import { getFeedbackTargetContext } from './getFeedbackTargetContext'

const countHiddenAnswers = (data: FeedbackData) =>
  Array.isArray(data) ? data.filter(answer => answer.hidden === true).length : 0

const computeHiddenCountForFeedbackTarget = async (feedbackTargetId: number) => {
  const feedbacks = await Feedback.findAll({
    include: {
      model: UserFeedbackTarget,
      as: 'userFeedbackTarget',
      where: { feedbackTargetId },
    },
  })

  return feedbacks.reduce((sum, feedback) => sum + countHiddenAnswers(feedback?.data), 0)
}

export const refreshFeedbackTargetHiddenCount = async (feedbackTargetId: number, transaction?: Transaction) => {
  const hiddenCount = await computeHiddenCountForFeedbackTarget(feedbackTargetId)

  await FeedbackTarget.update(
    { hiddenCount },
    {
      where: { id: feedbackTargetId },
      transaction,
    }
  )

  feedbackTargetCache.invalidate(feedbackTargetId)
  return hiddenCount
}

type HideFeedbackParams = {
  feedbackTargetId: number
  questionId: number
  hidden: boolean
  user: User
  feedbackContent: string
}

const hideFeedback = async ({ feedbackTargetId, questionId, hidden, user, feedbackContent }: HideFeedbackParams) => {
  if (typeof hidden !== 'boolean') {
    throw ApplicationError.BadRequest('Invalid value for hidden')
  }

  const { feedbackTarget, access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })
  if (!access?.canHideFeedback())
    throw ApplicationError.Forbidden('Must be responsible teacher, organisation admin or admin')

  const allFeedbacks = await Feedback.findAll({
    include: {
      model: UserFeedbackTarget,
      as: 'userFeedbackTarget',
      where: {
        feedbackTargetId,
      },
    },
  })

  const feedbacksWithCounts = allFeedbacks.map(feedback => {
    if (!Array.isArray(feedback.data)) {
      return { feedback, matchedCount: 0, changedCount: 0 }
    }

    const { data, matchedCount, changedCount } = setOpenAnswersHidden(
      feedback.data,
      questionId,
      feedbackContent,
      hidden
    )
    feedback.data = data

    return { feedback, matchedCount, changedCount }
  })

  const matchingCount = feedbacksWithCounts.reduce((sum, item) => sum + item.matchedCount, 0)
  const totalChanged = feedbacksWithCounts.reduce((sum, item) => sum + item.changedCount, 0)
  const feedbacksToSave = feedbacksWithCounts.filter(item => item.changedCount > 0).map(item => item.feedback)

  if (matchingCount === 0) throw ApplicationError.BadRequest('Matching feedback not found')

  if (totalChanged > 0) {
    await sequelize.transaction(async transaction => {
      await feedbackTarget.increment({ hiddenCount: hidden ? totalChanged : -totalChanged }, { transaction })

      for (const feedback of feedbacksToSave) {
        await feedback.save({ transaction })
      }
    })
  }

  return totalChanged
}

type AdminDeleteFeedbackParams = {
  feedbackTargetId: number
  questionId: number
  user: User
  feedbackContent: string
}

const adminDeleteFeedback = async ({
  feedbackTargetId,
  questionId,
  user,
  feedbackContent,
}: AdminDeleteFeedbackParams) => {
  const { feedbackTarget, access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })
  if (!access?.canAdminDeleteFeedback()) throw ApplicationError.Forbidden('Must be admin')

  const allFeedbacks = await Feedback.findAll({
    include: {
      model: UserFeedbackTarget,
      as: 'userFeedbackTarget',
      where: {
        feedbackTargetId,
      },
    },
  })

  const feedbacksToUpdate = allFeedbacks
    .map(feedback => {
      if (!Array.isArray(feedback.data)) return { updated: false }

      const { data, removed } = removeOpenAnswers(feedback.data, questionId, feedbackContent)
      feedback.data = data

      return { updated: removed, feedback }
    })
    .filter(({ updated }) => updated)
    .map(({ feedback }) => feedback)

  if (feedbacksToUpdate.length === 0) throw ApplicationError.BadRequest('Matching feedback not found')

  for (const feedback of feedbacksToUpdate) {
    await feedback?.save()
  }

  await refreshFeedbackTargetHiddenCount(feedbackTarget.id)

  feedbackTargetCache.invalidate(feedbackTarget.id)

  return feedbacksToUpdate.length
}

export { hideFeedback, adminDeleteFeedback }
