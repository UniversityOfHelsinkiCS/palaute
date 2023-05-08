const { differenceInHours, format } = require('date-fns')
const { CourseUnit } = require('../../models')
const { FEEDBACK_REMINDER_COOLDOWN, PUBLIC_URL } = require('../../util/config')
const { ApplicationError } = require('../../util/customErrors')
const { pate } = require('../pateClient')
const { i18n } = require('../../util/i18n')

const sendReminderToGiveFeedbackToStudents = async (urlToGiveFeedback, students, courseNames, reminder, closesAt) => {
  const emails = students.map(student => {
    const t = i18n.getFixedT(student.language ?? 'en')
    const courseName = courseNames[student.language ?? 'en']

    const email = {
      to: student.email,
      subject: t('mails:reminderOnFeedbackToStudents:subject', { courseName }),
      text: t('mails:reminderOnFeedbackToStudents:text', { url: urlToGiveFeedback, courseName, reminder, closesAt }),
    }
    return email
  })

  await pate.send(emails, 'Remind students about feedback')

  return emails
}

const sendFeedbackReminderToStudents = async (feedbackTarget, reminder) => {
  if (differenceInHours(new Date(), feedbackTarget.feedbackReminderLastSentAt) < FEEDBACK_REMINDER_COOLDOWN) {
    throw new ApplicationError(`Can send only 1 feedback reminder every ${FEEDBACK_REMINDER_COOLDOWN} hours`, 403)
  }

  const courseUnit = await CourseUnit.findByPk(feedbackTarget.courseUnitId)
  const students = await feedbackTarget.getStudentsWhoHaveNotGivenFeedback()
  const url = `${PUBLIC_URL}/targets/${feedbackTarget.id}/feedback`
  const formattedStudents = students
    .filter(student => student.email)
    .map(student => ({
      email: student.email,
      language: student.language || 'en',
    }))

  const formattedClosesAt = format(new Date(feedbackTarget.closesAt), 'dd.MM.yyyy')

  return (async () => {
    const emails = await sendReminderToGiveFeedbackToStudents(
      url,
      formattedStudents,
      courseUnit.name,
      reminder,
      formattedClosesAt
    )

    feedbackTarget.feedbackReminderLastSentAt = new Date()
    await feedbackTarget.save()

    return emails
  })()
}

module.exports = { sendFeedbackReminderToStudents }
