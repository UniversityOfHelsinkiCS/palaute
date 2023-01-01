const { differenceInMonths } = require('date-fns')
const { mailer } = require('../../mailer')
const { ApplicationError } = require('../../util/customErrors')
const { getAccess } = require('./getAccess')
const { getFeedbackTarget } = require('./util')

const isTooOld = feedbackTarget => differenceInMonths(Date.now(), Date.parse(feedbackTarget.closesAt)) > 6

const updateFeedbackResponse = async ({ feedbackTargetId, user, isAdmin, responseText, sendEmail }) => {
  const feedbackTarget = await getFeedbackTarget({ feedbackTargetId, user })
  if (!feedbackTarget) ApplicationError.NotFound('Feedbacktarget for response not found')

  const userFeedbackTarget = feedbackTarget.userFeedbackTargets[0]
  const access = await getAccess({
    userFeedbackTarget,
    user,
    feedbackTarget,
    isAdmin,
  })

  if (!access.canUpdateResponse()) {
    ApplicationError.Forbidden('No rights to update feedback response')
  }

  if (sendEmail && feedbackTarget.feedbackResponseEmailSent) {
    throw new ApplicationError('Counter feedback email has already been sent', 400)
  }

  if (isTooOld(feedbackTarget)) {
    ApplicationError.Forbidden('Cannot send counter feedback because feedback closed over 6 months ago')
  }

  feedbackTarget.feedbackResponse = responseText
  feedbackTarget.feedbackResponseEmailSent = sendEmail || feedbackTarget.feedbackResponseEmailSent

  if (sendEmail) {
    await mailer.sendFeedbackSummaryReminderToStudents(feedbackTarget, responseText)
  }

  await feedbackTarget.save()

  return feedbackTarget.toJSON()
}

module.exports = {
  updateFeedbackResponse,
}
