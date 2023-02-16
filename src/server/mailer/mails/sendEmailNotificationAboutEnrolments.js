const { format } = require('date-fns')
const { PUBLIC_URL } = require('../../util/config')
const { pate } = require('../pateClient')

const buildNotificationAboutEnrolment = (urlToGiveFeedback, courseName, closesAt) => {
  const translations = {
    text: {
      en: `Dear student!\n 
          We've received your enrolment and you can now give feedback on <a href=${urlToGiveFeedback}>${courseName.en}</a>. 
          The feedback period ends on ${closesAt}.`,
      fi: `Hyvä opiskelija!\n 
          Saimme ilmoittautumisesi ja voit nyt antaa palautetta kurssille <a href=${urlToGiveFeedback}>${courseName.fi}</a> palautteeseen.
          Palautejakso päättyy ${closesAt}.`,
      sv: `Bästa studerande!\n
          We've received your enrolment and you can now give feedback on <a href=${urlToGiveFeedback}>${courseName.sv}</a>. 
          Responsperioden tar slut ${closesAt}.`,
    },
    subject: {
      en: `You can now give feedback on ${courseName.en}`,
      fi: `Voit nyt antaa palautetta kurssille ${courseName.fi}`,
      sv: `You can now give feedback on ${courseName.sv}`,
    },
  }

  return translations
}

const sendEmailNotificationAboutEnrolments = async userFeedbackTargets => {
  const emails = []

  for (const userFeedbackTarget of userFeedbackTargets) {
    const [student, feedbackTarget] = await Promise.all([
      userFeedbackTarget.getUser(),
      userFeedbackTarget.getFeedbackTarget(),
    ])
    // eslint-disable-next-line no-continue
    if (await feedbackTarget.isDisabled()) continue

    const courseUnit = await feedbackTarget.getCourseUnit()
    const url = `${PUBLIC_URL}/${feedbackTarget.id}/feedback`

    const formattedClosesAt = format(new Date(feedbackTarget.closesAt), 'dd.MM.yyyy')

    const translations = buildNotificationAboutEnrolment(url, courseUnit.name, formattedClosesAt)

    const email = {
      to: student.getDefaultEmail(),
      subject: translations.subject[student.language] || translations.subject.en,
      text: translations.text[student.language] || translations.text.en,
    }

    emails.push(email)
  }

  await pate.send(emails, 'Notification on enrolment')

  return emails
}

module.exports = { sendEmailNotificationAboutEnrolments }
