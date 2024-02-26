const jwt = require('jsonwebtoken')

const { ApplicationError } = require('../../util/customErrors')
const { getFeedbackTargetContext } = require('./getFeedbackTargetContext')
const { JWT_KEY } = require('../../util/config')

/**
 * Returns a token that can be used to enrol to a feedback target.
 * Note that this is only allowed for userCreated feedbackTargets.
 * Only teachers and org admins can get the enrolment token.
 * The enrolment token can always be fetched, but can only be used if the feedback target is open for enrolment.
 */
const getEnrolmentToken = async ({ feedbackTargetId, user }) => {
  const { feedbackTarget, access } = await getFeedbackTargetContext({ feedbackTargetId, user })

  if (!access?.canSeeTokens()) ApplicationError.Forbidden()

  if (!feedbackTarget.userCreated)
    ApplicationError.Forbidden('Only userCreated feedbackTargets can have enrolment tokens')

  return jwt.sign({ feedbackTargetId }, JWT_KEY)
}

module.exports = {
  getEnrolmentToken,
}
