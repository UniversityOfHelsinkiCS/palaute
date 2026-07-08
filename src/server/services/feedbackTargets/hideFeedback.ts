import feedbackTargetCache from './feedbackTargetCache'
import { sequelize } from '../../db/dbConnection'
import { Feedback, UserFeedbackTarget } from '../../models'
import { ApplicationError } from '../../util/ApplicationError'
import { getFeedbackTargetContext } from './getFeedbackTargetContext'
import { User } from '../../models/user'

interface HideFeedbackParams {
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

    let matchedCount = 0
    let changedCount = 0

    feedback.data = feedback.data.map(answer => {
      if (answer.data === feedbackContent && answer.questionId === questionId) {
        matchedCount += 1

        const isCurrentlyHidden = Boolean(answer.hidden)
        if (isCurrentlyHidden !== hidden) {
          changedCount += 1
          return { ...answer, hidden }
        }
      }
      return answer
    })

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

interface AdminDeleteFeedbackParams {
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
  // check access
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

      let updated = false
      feedback.data = feedback.data.filter(answer => {
        if (answer.data === feedbackContent && answer.questionId === questionId) {
          updated = true
          return false
        }
        return true
      })

      return { updated, feedback }
    })
    .filter(({ updated }) => updated)
    .map(({ feedback }) => feedback)

  if (feedbacksToUpdate.length === 0) throw ApplicationError.BadRequest('Matching feedback not found')

  for (const feedback of feedbacksToUpdate) {
    await feedback?.save()
  }
  feedbackTargetCache.invalidate(feedbackTarget.id)

  return feedbacksToUpdate.length
}

export { hideFeedback, adminDeleteFeedback }
