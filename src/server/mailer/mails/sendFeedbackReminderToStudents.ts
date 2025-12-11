import { differenceInHours, format } from 'date-fns'
import { LanguageId, LocalizedString } from '@common/types/common'
import { FEEDBACK_REMINDER_COOLDOWN, PUBLIC_URL } from '../../util/config'
import { ApplicationError } from '../../util/ApplicationError'
import { pate } from '../pateClient'
import { i18n } from '../../util/i18n'
import { getLanguageValue } from '../../util/languageUtils'
import { FeedbackTarget } from '../../models'

const sendReminderToGiveFeedbackToStudents = async (
  urlToGiveFeedback: string,
  students: { email: string; language: LanguageId }[],
  courseNames: LocalizedString,
  reminder: string,
  closesAt: string,
  userCreated: boolean
) => {
  const emails = students.map(student => {
    const t = i18n.getFixedT(student.language ?? 'en')
    const courseName = getLanguageValue(courseNames, student.language)

    // Custom texts for user created feedback targets because they are not courses
    // Default reminder text is used if reminder is empty
    const emailText =
      reminder.trim().length > 0
        ? t('mails:reminderOnFeedbackToStudents:linkToSurvey', {
            url: urlToGiveFeedback,
            courseName,
            reminder,
            interpolation: { escapeValue: false },
          })
        : t(`mails:reminderOnFeedbackToStudents:${userCreated ? 'customText' : 'text'}`, {
            url: urlToGiveFeedback,
            courseName,
            closesAt,
            interpolation: { escapeValue: false },
          })

    const email = {
      to: student.email,
      subject: t(`mails:reminderOnFeedbackToStudents:${userCreated ? 'customSubject' : 'subject'}`, {
        courseName,
        interpolation: { escapeValue: false },
      }),
      text: emailText,
    }

    return email
  })

  await pate.send(emails, 'Remind students about feedback')

  return emails
}

export const sendFeedbackReminderToStudents = async (
  feedbackTarget: FeedbackTarget,
  reminder: string,
  courseName: LocalizedString
) => {
  if (differenceInHours(new Date(), feedbackTarget.feedbackReminderLastSentAt) < FEEDBACK_REMINDER_COOLDOWN) {
    throw new ApplicationError(`Can send only 1 feedback reminder every ${FEEDBACK_REMINDER_COOLDOWN} hours`, 403)
  }

  const students = await feedbackTarget.getStudentsWhoHaveNotReactedToSurvey()
  const url = `${PUBLIC_URL}/targets/${feedbackTarget.id}/feedback`
  const formattedStudents = students
    .filter(student => student.email)
    .map(student => ({
      email: student.email,
      language: student.language || ('en' as LanguageId),
    }))

  const formattedClosesAt = format(new Date(feedbackTarget.closesAt), 'dd.MM.yyyy')

  return (async () => {
    const emails = await sendReminderToGiveFeedbackToStudents(
      url,
      formattedStudents,
      courseName,
      reminder,
      formattedClosesAt,
      feedbackTarget.userCreated
    )

    feedbackTarget.feedbackReminderLastSentAt = new Date()
    await feedbackTarget.save()

    return emails
  })()
}
