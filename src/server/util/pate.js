const axios = require('axios')

const { inProduction } = require('../../config')
const logger = require('./logger')

const template = {
  from: 'Norppa',
}

const settings = {
  hideToska: false,
  disableToska: true,
  color: '#107eab',
  header: 'Norppa',
  dryrun: !inProduction,
}

const pateClient = axios.create({
  baseURL: 'https://pate.toska.cs.helsinki.fi',
  params: {
    token: process.env.PATE_API_TOKEN,
  },
})

const sendEmail = async (options = {}) => {
  if (!inProduction) {
    logger.debug('Skipped sending email in non-production environment', options)
    return null
  }

  const { data } = await pateClient.post('/', options)

  return data
}

const sendNotificationAboutSurveyOpeningToStudents = () => {
  const feedbackTargets = []

  for (feedbackTarget of feedbackTargets) {
    const translations = {
      text: {
        en: `The feedback survey for the course ${courseName} has opened. Please give your feedback here: ${courseUrl}`,
        fi: `Palautteen antaminen kurssille ${courseName} on alkanut. Anna ystävällisesti palautetta täällä: ${courseUrl}`,
        sv: ``,
      },
      subject: {
        en: `Course feedback has opened`,
        fi: `Kurssipalaute on avautunut`,
        sv: ``,
      },
    }
  }
}

const sendNotificationAboutFeedbackSummaryToStudents = (
  urlToSeeFeedbackSummary,
  students,
) => {
  const translations = {
    text: {
      en: `Feedback summary was given by teacher, read it here: ${urlToSeeFeedbackSummary}`,
      fi: `Palauteyhteenveto on annettu opettajan toimesta, lue se täältä: ${urlToSeeFeedbackSummary}`,
      sv: '',
    },
    subject: {
      en: 'A new feedback summary from your teacher',
      fi: 'Uusi palauteyhteenveto opettajaltasi',
      sv: '',
    },
  }
  const emails = students.map((student) => {
    const email = {
      to: student.email,
      subject:
        translations.subject[student.language] || translations.subject.en,
      text: translations.text[student.language] || translations.text.en,
    }
    return email
  })
  const options = {
    template: {
      ...template,
    },
    emails,
    settings: { ...settings },
  }

  sendEmail(options)

  return options
}

module.exports = {
  sendNotificationAboutFeedbackSummaryToStudents,
}
