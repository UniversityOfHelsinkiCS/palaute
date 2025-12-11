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
    throw new ApplicationError('Invalid value for hidden', 400)
  }

  // check access
  const { feedbackTarget, access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })
  if (!access?.canHideFeedback())
    return ApplicationError.Forbidden('Must be responsible teacher, organisation admin or admin')

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
      feedback.data = feedback.data.map(answer => {
        if (answer.data === feedbackContent && answer.questionId === questionId) {
          updated = true
          return { ...answer, hidden }
        }
        return answer
      })

      return { updated, feedback }
    })
    .filter(({ updated }) => updated)
    .map(({ feedback }) => feedback)

  if (feedbacksToUpdate.length === 0) return ApplicationError.BadRequest('Matching feedback not found')

  await sequelize.transaction(async transaction => {
    await feedbackTarget.increment(
      { hiddenCount: hidden ? feedbacksToUpdate.length : -feedbacksToUpdate.length },
      { transaction }
    )
    for (const feedback of feedbacksToUpdate) {
      await feedback.save()
    }
  })

  return feedbacksToUpdate.length
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
  if (!access?.canAdminDeleteFeedback()) return ApplicationError.Forbidden('Must be admin')

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

  if (feedbacksToUpdate.length === 0) return ApplicationError.BadRequest('Matching feedback not found')

  for (const feedback of feedbacksToUpdate) {
    await feedback.save()
  }
  feedbackTargetCache.invalidate(feedbackTarget.id)

  return feedbacksToUpdate.length
}

export { hideFeedback, adminDeleteFeedback }
