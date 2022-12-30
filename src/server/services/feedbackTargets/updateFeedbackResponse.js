const { differenceInMonths } = require('date-fns')
const { mailer } = require('../../mailer')
const {
  FeedbackTarget,
  UserFeedbackTarget,
  CourseRealisation,
} = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const { getAccessStatus } = require('./getAccessStatus')

// This should really be a Model scope (check sequelize docs)
const getFeedbackTarget = async (id, userId) => {
  const fbt = await FeedbackTarget.findByPk(id, {
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        where: { userId },
        limit: 1,
        required: false,
      },
      { model: CourseRealisation, as: 'courseRealisation' },
    ],
  })
  if (!fbt) ApplicationError.NotFound('Feedback target for response not found')
}

const isTooOld = (feedbackTarget) =>
  differenceInMonths(Date.now(), Date.parse(feedbackTarget.closesAt)) > 6

const updateFeedbackResponse = async ({
  feedbackTargetId,
  user,
  isAdmin,
  responseText,
  sendEmail,
}) => {
  const feedbackTarget = await getFeedbackTarget(feedbackTargetId, user.id)
  const userFeedbackTarget = feedbackTarget.userFeedbackTargets[0]
  const accessStatus = await getAccessStatus(
    userFeedbackTarget,
    user,
    feedbackTarget,
    isAdmin,
  )
  if (accessStatus !== 'RESPONSIBLE_TEACHER') {
    ApplicationError.Forbidden(
      'Cannot update response: not responsible teacher',
    )
  }

  if (sendEmail && feedbackTarget.feedbackResponseEmailSent) {
    throw new ApplicationError(
      'Counter feedback email has already been sent',
      400,
    )
  }

  if (isTooOld(feedbackTarget)) {
    ApplicationError.Forbidden(
      'Cannot send counter feedback because feedback closed over 6 months ago',
    )
  }

  feedbackTarget.feedbackResponse = responseText
  feedbackTarget.feedbackResponseEmailSent =
    sendEmail || feedbackTarget.feedbackResponseEmailSent

  if (sendEmail) {
    await mailer.sendFeedbackSummaryReminderToStudents(
      feedbackTarget,
      responseText,
    )
  }

  await feedbackTarget.save()

  return feedbackTarget.toJSON()
}

module.exports = {
  updateFeedbackResponse,
}
