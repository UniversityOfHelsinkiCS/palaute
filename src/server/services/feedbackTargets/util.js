const { FeedbackTarget, UserFeedbackTarget, CourseRealisation } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')

const getFeedbackTarget = async ({ feedbackTargetId, user }) => {
  const feedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId, {
    where: { hidden: false },
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        where: { userId: user.id },
        limit: 1,
        required: false, // If user enrolled/teacher, userfeedback is included. Otherwise not.
      },
      { model: CourseRealisation, as: 'courseRealisation' },
    ],
  })

  if (!feedbackTarget) ApplicationError.NotFound(`FeedbackTarget with id ${feedbackTargetId} not found`)

  return {
    feedbackTarget,
    userFeedbackTarget: feedbackTarget.userFeedbackTargets ? feedbackTarget.userFeedbackTargets[0] : null,
  }
}

module.exports = {
  getFeedbackTarget,
}
