const { mailer } = require('../../mailer')
const { FeedbackTarget } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')

const remindStudentsOnFeedback = async ({ feedbackTargetId, reminderText, user }) => {
  let relevantFeedbackTarget
  if (user.dataValues.isAdmin) {
    relevantFeedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId)
  } else {
    const feedbackTargetsUserIsTeacherTo = await user.feedbackTargetsHasTeacherAccessTo()

    relevantFeedbackTarget = feedbackTargetsUserIsTeacherTo.find(target => target.id === feedbackTargetId)
  }

  if (!relevantFeedbackTarget)
    ApplicationError.NotFound(`No feedback target found with id ${feedbackTargetId} for user`, 404)

  await mailer.sendFeedbackReminderToStudents(relevantFeedbackTarget, reminderText)

  return relevantFeedbackTarget
}

module.exports = {
  remindStudentsOnFeedback,
}
