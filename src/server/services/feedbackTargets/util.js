const { FeedbackTarget, UserFeedbackTarget, CourseRealisation } = require('../../models')

const getFeedbackTarget = (id, userId) =>
  FeedbackTarget.findByPk(id, {
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        where: { userId },
        limit: 1,
        required: false,
      },
      { model: CourseRealisation, as: 'courseRealisation' },
    ],
  })

module.exports = {
  getFeedbackTarget,
}
