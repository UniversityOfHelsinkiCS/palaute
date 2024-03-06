const { format } = require('date-fns')
const { PUBLIC_URL } = require('../../util/config')
const { pate } = require('../pateClient')
const { i18n } = require('../../util/i18n')
const { getLanguageValue } = require('../../util/languageUtils')

const sendNotificationAboutFeedbackResponseToStudents = async (
  urlToSeeFeedbackSummary,
  students,
  courseName,
  startDate,
  endDate,
  feedbackResponse,
  userCreated
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
      }),
      text: t(`mails:counterFeedbackNotificationToStudents:${userCreated ? 'customText' : 'text'}`, {
        courseName: courseNameWithUserLanguage,
        dates,
        feedbackResponse,
        urlToSeeFeedbackSummary,
      }),
    }
    return email
  })

  await pate.send(emails, 'Notify students about counter feedback')

  return emails
}

const sendFeedbackSummaryReminderToStudents = async (feedbackTarget, feedbackResponse) => {
  const courseUnit = await feedbackTarget.getCourseUnit()
  const cr = await feedbackTarget.getCourseRealisation()
  const students = await feedbackTarget.getStudentsForFeedbackTarget()
  const url = `${PUBLIC_URL}/targets/${feedbackTarget.id}/results`
  const formattedStudents = students
    .filter(student => student.email)
    .map(student => ({
      email: student.email,
      language: student.language || 'en',
    }))
  return sendNotificationAboutFeedbackResponseToStudents(
    url,
    formattedStudents,
    feedbackTarget.userCreated ? feedbackTarget.name : courseUnit.name,
    cr.startDate,
    cr.endDate,
    feedbackResponse,
    feedbackTarget.userCreated
  )
}

module.exports = { sendFeedbackSummaryReminderToStudents }
