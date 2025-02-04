const { FeedbackTarget, UserFeedbackTarget, CourseRealisation, Summary } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const { getAccess } = require('./getAccess')

/**
 * Fetch fbt, ufbt and compute access object.
 * Useful for all things that consider an action on a single feedback target,
 * where action is either viewing or mutating.
 * Throws 404 when id does not match anything, so you don't have to check that.
 */
const getFeedbackTargetContext = async ({ feedbackTargetId, user }) => {
  const feedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId, {
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        where: { userId: user.id },
        limit: 1,
        required: false, // If user enrolled/teacher, userfeedback is included. Otherwise not.
      },
      { model: CourseRealisation, as: 'courseRealisation' },
      { model: Summary, as: 'summary' },
    ],
  })

  if (!feedbackTarget) ApplicationError.NotFound(`FeedbackTarget with id ${feedbackTargetId} not found`)

  const userFeedbackTarget = feedbackTarget.userFeedbackTargets ? feedbackTarget.userFeedbackTargets[0] : null

  const access = await getAccess({
    userFeedbackTarget,
    feedbackTarget,
    user,
  })

  return {
    feedbackTarget,
    userFeedbackTarget,
    access,
  }
}

module.exports = {
  getFeedbackTargetContext,
}
