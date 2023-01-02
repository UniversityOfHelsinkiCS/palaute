const { differenceInMonths } = require('date-fns')
const { mailer } = require('../../mailer')
const { ApplicationError } = require('../../util/customErrors')
const { getFeedbackTargetContext } = require('./util')

const isTooOld = feedbackTarget => differenceInMonths(Date.now(), Date.parse(feedbackTarget.closesAt)) > 6

const updateFeedbackResponse = async ({ feedbackTargetId, user, responseText, sendEmail }) => {
  const { feedbackTarget, access } = await getFeedbackTargetContext({ feedbackTargetId, user })

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
