const { differenceInHours, format } = require('date-fns')
const { FEEDBACK_REMINDER_COOLDOWN, PUBLIC_URL } = require('../../util/config')
const { ApplicationError } = require('../../util/customErrors')
const { pate } = require('../pateClient')
const { i18n } = require('../../util/i18n')
const { getLanguageValue } = require('../../util/languageUtils')
const { CourseUnit } = require('../../models')

const sendReminderToGiveFeedbackToStudents = async (
  urlToGiveFeedback,
  students,
  courseNames,
  reminder,
  closesAt,
  userCreated,
  courseCode
) => {
  const emails = students.map(student => {
    const t = i18n.getFixedT(student.language ?? 'en')
    const courseName = getLanguageValue(courseNames, student.language)

    // Custom texts for user created feedback targets because they are not courses
    // Default reminder text is used if reminder is empty
    const emailText =
      reminder.trim().length > 0
        ? reminder
        : t(`mails:reminderOnFeedbackToStudents:${userCreated ? 'customText' : 'text'}`, {
            url: urlToGiveFeedback,
            courseName,
            closesAt,
            courseCode,
            interpolation: { escapeValue: false },
          })

    const email = {
      to: student.email,
      subject: t(`mails:reminderOnFeedbackToStudents:${userCreated ? 'customSubject' : 'subject'}`, {
        courseName,
        courseCode,
        interpolation: { escapeValue: false },
      }),
      text: emailText,
    }

    return email
  })

  await pate.send(emails, 'Remind students about feedback')

  return emails
}

const sendFeedbackReminderToStudents = async (feedbackTarget, reminder, courseName) => {
  if (differenceInHours(new Date(), feedbackTarget.feedbackReminderLastSentAt) < FEEDBACK_REMINDER_COOLDOWN) {
    throw new ApplicationError(`Can send only 1 feedback reminder every ${FEEDBACK_REMINDER_COOLDOWN} hours`, 403)
  }

  const courseUnit = await CourseUnit.findByPk(feedbackTarget.CourseUnitId)
  const students = await feedbackTarget.getStudentsWhoHaveNotReactedToSurvey()
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
      courseName,
      reminder,
      formattedClosesAt,
      feedbackTarget.userCreated,
      courseUnit.courseCode
    )

    feedbackTarget.feedbackReminderLastSentAt = new Date()
    await feedbackTarget.save()

    return emails
  })()
}

module.exports = { sendFeedbackReminderToStudents }
