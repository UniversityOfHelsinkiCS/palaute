const { FeedbackTargetLog, User } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const { getAccess } = require('./getAccess')
const { getFeedbackTarget } = require('./util')

const getLogs = async ({ feedbackTargetId, user, isAdmin }) => {
  const { feedbackTarget, userFeedbackTarget } = getFeedbackTarget({
    feedbackTargetId,
    user,
  })

  const access = await getAccess({ userFeedbackTarget, user, feedbackTarget, isAdmin })

  if (!access.canSeeLogs()) {
    ApplicationError.Forbidden()
  }

  const logs = await FeedbackTargetLog.findAll({
    where: {
      feedbackTargetId,
    },
    include: {
      model: User,
      as: 'user',
    },
    order: [['createdAt', 'DESC']],
  })

  return logs
}

module.exports = {
  getLogs,
}
