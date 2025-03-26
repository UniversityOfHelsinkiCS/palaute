const feedbackTargetCache = require('./feedbackTargetCache')
const { sequelize } = require('../../db/dbConnection')
const { Feedback, UserFeedbackTarget } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const { getFeedbackTargetContext } = require('./getFeedbackTargetContext')

const hideFeedback = async ({ feedbackTargetId, questionId, hidden, user, feedbackContent }) => {
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
      feedback.save()
    }
  })

  return feedbacksToUpdate.length
}

const adminDeleteFeedback = async ({ feedbackTargetId, questionId, user, feedbackContent }) => {
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
    feedback.save()
  }
  feedbackTargetCache.invalidate(feedbackTarget.id)

  return feedbacksToUpdate.length
}

module.exports = {
  hideFeedback,
  adminDeleteFeedback,
}
