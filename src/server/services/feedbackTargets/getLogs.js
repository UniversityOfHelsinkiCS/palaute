const { FeedbackTargetLog, User } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const { getFeedbackTargetContext } = require('./getFeedbackTargetContext')

const getLogs = async ({ feedbackTargetId, user }) => {
  const { access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })

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
