const {
  updateSummaryAfterFeedbackResponseCreated,
  updateSummaryAfterFeedbackResponseDeleted,
} = require('../summary/updateSummaryOnFeedbackResponse')
const { mailer } = require('../../mailer')
const { ApplicationError } = require('../../util/customErrors')
const { createFeedbackResponseLog } = require('../auditLog/feedbackTargetLogs')
const { getFeedbackTargetContext } = require('./getFeedbackTargetContext')

const updateFeedbackResponse = async ({ feedbackTargetId, user, responseText, sendEmail }) => {
  const { feedbackTarget, access } = await getFeedbackTargetContext({ feedbackTargetId, user })

  if (!access?.canUpdateResponse()) {
    ApplicationError.Forbidden('No rights to update feedback response')
  }

  if (sendEmail && feedbackTarget.feedbackResponseEmailSent) {
    throw new ApplicationError('Counter feedback email has already been sent', 400)
  }

  const previousResponse = feedbackTarget.feedbackResponse
  feedbackTarget.feedbackResponse = responseText
  feedbackTarget.feedbackResponseEmailSent = sendEmail || feedbackTarget.feedbackResponseEmailSent

  if (sendEmail) {
    await mailer.sendFeedbackSummaryReminderToStudents(feedbackTarget, responseText)
  }

  await feedbackTarget.save()

  if (responseText > 0) {
    await updateSummaryAfterFeedbackResponseCreated(feedbackTarget)
  } else {
    await updateSummaryAfterFeedbackResponseDeleted(feedbackTarget)
  }

  await createFeedbackResponseLog({
    feedbackTarget,
    user,
    responseText,
    previousResponse,
    sendEmail,
  })

  return feedbackTarget.toJSON()
}

module.exports = {
  updateFeedbackResponse,
}
