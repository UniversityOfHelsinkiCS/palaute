const { FeedbackTarget, UserFeedbackTarget, CourseRealisation } = require('../../models')

const getFeedbackTarget = ({ feedbackTargetId, user }) =>
  FeedbackTarget.findByPk(feedbackTargetId, {
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        where: { userId: user.id },
        limit: 1,
        required: false,
      },
      { model: CourseRealisation, as: 'courseRealisation' },
    ],
  })

module.exports = {
  getFeedbackTarget,
}
