const { FeedbackTarget, UserFeedbackTarget, CourseRealisation } = require('../../models')

const getFeedbackTarget = ({ feedbackTargetId, user }) =>
  FeedbackTarget.findByPk(feedbackTargetId, {
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        where: { userId: user.id, hidden: false },
        limit: 1,
        required: false, // If user enrolled/teacher, userfeedback is included. Otherwise not.
      },
      { model: CourseRealisation, as: 'courseRealisation' },
    ],
  })

module.exports = {
  getFeedbackTarget,
}
