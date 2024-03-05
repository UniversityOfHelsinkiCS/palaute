const { mailer } = require('../../mailer')
const { ApplicationError } = require('../../util/customErrors')
const { getFeedbackTargetContext } = require('./getFeedbackTargetContext')

const remindStudentsOnFeedback = async ({ feedbackTargetId, reminderText, courseName, user }) => {
  const { feedbackTarget, access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })

  if (!access?.canSendReminderEmail()) ApplicationError.Forbidden('Not allowed to send reminder')

  await mailer.sendFeedbackReminderToStudents(feedbackTarget, reminderText, courseName)

  return feedbackTarget
}

module.exports = {
  remindStudentsOnFeedback,
}
