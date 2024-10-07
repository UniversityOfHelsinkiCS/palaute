const { UserFeedbackTarget } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')

const notGivingFeedback = async ({ feedbackTargetId, user }) => {
  const userFeedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      userId: user.id,
      feedbackTargetId,
    },
  })

  if (userFeedbackTargets.length === 0 || userFeedbackTargets.length > 1)
    return ApplicationError.BadRequest('Matching userFeedbackTarget not found')

  const userFeedbackTarget = userFeedbackTargets[0]
  userFeedbackTarget.notGivingFeedback = true
  userFeedbackTarget.save()

  return userFeedbackTarget.toJSON()
}

module.exports = {
  notGivingFeedback,
}
