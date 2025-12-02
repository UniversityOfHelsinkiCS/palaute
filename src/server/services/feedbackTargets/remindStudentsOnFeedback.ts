import { mailer } from '../../mailer'
import { ApplicationError } from '../../util/customErrors'
import { getFeedbackTargetContext } from './getFeedbackTargetContext'
import { User } from '../../models/user'

interface RemindStudentsParams {
  feedbackTargetId: number
  reminderText: string
  courseName: string
  user: User
}

const remindStudentsOnFeedback = async ({ feedbackTargetId, reminderText, courseName, user }: RemindStudentsParams) => {
  const { feedbackTarget, access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })

  if (!access?.canSendReminderEmail()) ApplicationError.Forbidden('Not allowed to send reminder')

  await mailer.sendFeedbackReminderToStudents(feedbackTarget, reminderText, courseName)

  return feedbackTarget
}

export { remindStudentsOnFeedback }
