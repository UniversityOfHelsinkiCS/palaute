const jwt = require('jsonwebtoken')

const { UserFeedbackTarget } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const { getFeedbackTargetContext } = require('./getFeedbackTargetContext')

// @feat Gradu survey
const enrollByToken = async ({ user, token }) => {
  const decoded = jwt.verify(token, process.env.JWT_KEY)
  const { feedbackTargetId } = decoded

  const { feedbackTarget, userFeedbackTarget } = await getFeedbackTargetContext({ feedbackTargetId, user })

  if (!feedbackTarget.userCreated)
    return ApplicationError.Forbidden('Only userCreated feedbackTargets can be enrolled to by token')

  if (!feedbackTarget.tokenEnrolmentEnabled)
    return ApplicationError.Forbidden('Token enrolment not enabled for this feedback target')

  if (userFeedbackTarget) {
    if (userFeedbackTarget.accessStatus === 'STUDENT') return ApplicationError.Conflict('User already enrolled')
    return ApplicationError.Conflict('User already is staff on this course')
  }

  const newUserFeedbackTarget = await UserFeedbackTarget.create({
    feedbackTargetId,
    userId: user.id,
    accessStatus: 'STUDENT',
    userCreated: true,
  })

  return newUserFeedbackTarget
}

module.exports = {
  enrollByToken,
}
