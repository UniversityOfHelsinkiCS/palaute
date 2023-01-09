const { mailer } = require('../../mailer')
const { ApplicationError } = require('../../util/customErrors')
const { getFeedbackTargetContext } = require('./getFeedbackTargetContext')

const remindStudentsOnFeedback = async ({ feedbackTargetId, reminderText, user }) => {
  const { feedbackTarget, access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })

  if (!access?.canSendReminderEmail()) ApplicationError.Forbidden("You're not responsible teacher")

  await mailer.sendFeedbackReminderToStudents(feedbackTarget, reminderText)

  return feedbackTarget
}

module.exports = {
  remindStudentsOnFeedback,
}
