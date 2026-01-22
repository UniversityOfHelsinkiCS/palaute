import { format } from 'date-fns'
import { LanguageId, LocalizedString } from '@common/types/common'
import { PUBLIC_URL } from '../../util/config'
import { pate } from '../pateClient'
import { i18n } from '../../util/i18n'
import { getLanguageValue } from '../../util/languageUtils'
import { FeedbackTarget } from '../../models'

const sendNotificationAboutFeedbackResponseToStudents = async (
  urlToSeeFeedbackSummary: string,
  students: { email: string; language: LanguageId }[],
  courseName: LocalizedString,
  startDate: Date,
  endDate: Date,
  feedbackResponse: string,
  userCreated: boolean,
  courseCode: string
) => {
  const dates = `(${format(startDate, 'dd.MM')} - ${format(endDate, 'dd.MM.yyyy')})`

  const emails = students.map(student => {
    const { language } = student
    const t = i18n.getFixedT(language)
    const courseNameWithUserLanguage = getLanguageValue(courseName, language)

    const email = {
      to: student.email,
      subject: t(`mails:counterFeedbackNotificationToStudents:${userCreated ? 'customSubject' : 'subject'}`, {
        courseName: courseNameWithUserLanguage,
        courseCode,
      }),
      text: t(`mails:counterFeedbackNotificationToStudents:${userCreated ? 'customText' : 'text'}`, {
        courseName: courseNameWithUserLanguage,
        dates,
        feedbackResponse,
        urlToSeeFeedbackSummary,
        courseCode,
      }),
    }
    return email
  })

  await pate.send(emails, 'Notify students about counter feedback')

  return emails
}

export const sendFeedbackSummaryReminderToStudents = async (
  feedbackTarget: FeedbackTarget,
  feedbackResponse: string
) => {
  const courseUnit = await feedbackTarget.getCourseUnit()
  const courseRealisation = await feedbackTarget.getCourseRealisation()
  const students = await feedbackTarget.getStudentsForFeedbackTarget()
  const url = `${PUBLIC_URL}/targets/${feedbackTarget.id}/results`
  const formattedStudents = students
    .filter(student => student.email)
    .map(student => ({
      email: student.email,
      language: student.language || ('en' as LanguageId),
    }))
  return sendNotificationAboutFeedbackResponseToStudents(
    url,
    formattedStudents,
    feedbackTarget.userCreated ? feedbackTarget.name : courseRealisation.name,
    courseRealisation.startDate,
    courseRealisation.endDate,
    feedbackResponse,
    feedbackTarget.userCreated,
    courseUnit.courseCode
  )
}
