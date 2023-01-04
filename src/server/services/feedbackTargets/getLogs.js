const { FeedbackTargetLog, User } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const { getAccess } = require('./getAccess')
const { getFeedbackTargetContext } = require('./util')

const getLogs = async ({ feedbackTargetId, user }) => {
  const { feedbackTarget, userFeedbackTarget } = getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })

  const access = await getAccess({ userFeedbackTarget, user, feedbackTarget })

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
