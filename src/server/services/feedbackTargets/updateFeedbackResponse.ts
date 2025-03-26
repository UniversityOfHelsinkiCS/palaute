import {
  updateSummaryAfterFeedbackResponseCreated,
  updateSummaryAfterFeedbackResponseDeleted,
} from '../summary/updateSummaryOnFeedbackResponse'
import { mailer } from '../../mailer'
import { ApplicationError } from '../../util/customErrors'
import { createFeedbackResponseLog } from '../auditLog/feedbackTargetLogs'
import { getFeedbackTargetContext } from './getFeedbackTargetContext'
import { User } from '../../models'

export const updateFeedbackResponse = async ({
  feedbackTargetId,
  user,
  responseText,
  sendEmail,
}: {
  feedbackTargetId: number
  user: User
  responseText: string
  sendEmail: boolean
}) => {
  const { feedbackTarget, access } = (await getFeedbackTargetContext({ feedbackTargetId, user })) as any // @TODO fix

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

  if (responseText.length > 0 && !(previousResponse?.length > 0)) {
    await updateSummaryAfterFeedbackResponseCreated(feedbackTarget.id)
  } else if (responseText.length === 0 && previousResponse.length > 0) {
    await updateSummaryAfterFeedbackResponseDeleted(feedbackTarget.id)
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
