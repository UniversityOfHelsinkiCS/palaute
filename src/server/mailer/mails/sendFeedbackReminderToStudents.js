const { differenceInHours, format } = require('date-fns')
const { CourseUnit } = require('../../models')
const { FEEDBACK_REMINDER_COOLDOWN } = require('../../util/config')
const { ApplicationError } = require('../../util/customErrors')
const { pate } = require('../pateClient')

const buildReminderToGiveFeedbackToStudents = (urlToGiveFeedback, courseName, reminder, closesAt) => {
  const translations = {
    text: {
      en: `Dear student!\n 
          Please give feedback for the course <a href=${urlToGiveFeedback}>${courseName.en}</a>. 
          The feedback period ends on ${closesAt}. Thank you!\n
          ${reminder}`,
      fi: `Hyvä opiskelija!\n 
          Vastaathan kurssin <a href=${urlToGiveFeedback}>${courseName.fi}</a> palautteeseen.
          Palautejakso päättyy ${closesAt}. Kiitos!\n 
          ${reminder}`,
      sv: `Bästa studerande!\n
          Ge gärna respons på kursen <a href=${urlToGiveFeedback}>${courseName.sv}</a>. 
          Responsperioden tar slut ${closesAt}. Tack!\n
          ${reminder}`,
    },
    subject: {
      en: `Please give feedback for the course ${courseName.en}`,
      fi: `Annathan palautetta kurssille ${courseName.fi}`,
      sv: `Ge gärna respons på kursen ${courseName.sv}`,
    },
  }

  return translations
}

const sendReminderToGiveFeedbackToStudents = async (urlToGiveFeedback, students, courseName, reminder, closesAt) => {
  const translations = buildReminderToGiveFeedbackToStudents(urlToGiveFeedback, courseName, reminder, closesAt)

  const emails = students.map(student => {
    const email = {
      to: student.email,
      subject: translations.subject[student.language] || translations.subject.en,
      text: translations.text[student.language] || translations.text.en,
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
  const url = `https://coursefeedback.helsinki.fi/targets/${feedbackTarget.id}/feedback`
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
