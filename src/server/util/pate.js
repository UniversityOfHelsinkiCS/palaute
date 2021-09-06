const axios = require('axios')

const { inProduction, inStaging } = require('../../config')
const logger = require('./logger')

const template = {
  from: 'Norppa',
}

const settings = {
  hideToska: false,
  disableToska: true,
  color: '#107eab',
  header: 'Norppa',
  dryrun: !inProduction || inStaging,
}

const pateClient = axios.create({
  baseURL: 'https://pate.toska.cs.helsinki.fi',
  params: {
    token: process.env.PATE_API_TOKEN,
  },
})

const sendEmail = async (options = {}) => {
  if (!inProduction || inStaging) {
    logger.debug('Skipped sending email in non-production environment', options)
    return null
  }

  const { data } = await pateClient.post('/', options)

  return data
}

const sendNotificationAboutSurveyOpeningToStudents = (
  urlToGiveFeedbackTo,
  students,
  courseName,
) => {
  const translations = {
    text: {
      en: `The feedback survey for the course ${courseName.en} has opened. Please give your feedback here: ${urlToGiveFeedbackTo}`,
      fi: `Hyvä opiskelija! Kurssin ${courseName.fi} kurssipalautelomake on nyt auki! 
      Käythän vastaamassa kurssipalautteeseen, jotta voimme kehittää opetusta ja yliopiston toimintaa. 
      Vastattuasi näet palautekoosteen ja voit muokata vastauksia kyselyn ollessa auki.
      Palautetta voit antaa täällä: ${urlToGiveFeedbackTo}`,
      sv: ``,
    },
    subject: {
      en: `Course feedback has opened`,
      fi: `Kurssipalaute on avautunut`,
      sv: ``,
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

const sendNotificationAboutFeedbackSummaryToStudents = (
  urlToSeeFeedbackSummary,
  students,
  courseName,
) => {
  const translations = {
    text: {
      en: `Feedback summary for the course ${courseName.en} was given by teacher, read it here: ${urlToSeeFeedbackSummary}`,
      fi: `Hyvä opiskelija! Kurssin ${courseName.fi} opettaja on antanut vastapalautteen kurssin opiskelijoilta saadun palautteen perusteella. Voit käydä lukemassa palautteen täältä: ${urlToSeeFeedbackSummary}`,
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

const sendEmailReminderAboutSurveyOpeningToTeachers = (
  urlToEditSurvey,
  teachers,
  courseName,
) => {
  const translations = {
    text: {
      en: `Feedback survey for the course ${courseName.en} you are teaching is opening in a week. Edit it here: ${urlToEditSurvey}`,
      fi: `Hyvä kurssin ${courseName.fi} opettaja! Kurssipalautelomake aukeaa viikon päästä ja on auki neljä viikkoa. Lisääthän mahdolliset omat kysymyksesi ennen sitä. Kysymyksiä voit lisätä täällä: ${urlToEditSurvey}. Kiitos!`,
      sv: '',
    },
    subject: {
      en: `Feedback for a course you're teaching is about to start`,
      fi: `Palautejakso opettamallesi kurssille on alkamassa`,
      sv: '',
    },
  }

  const emails = teachers.map((teacher) => {
    const email = {
      to: teacher.email,
      subject:
        translations.subject[teacher.language] || translations.subject.en,
      text: translations.text[teacher.language] || translations.subject.en,
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
  sendNotificationAboutSurveyOpeningToStudents,
  sendNotificationAboutFeedbackSummaryToStudents,
  sendEmailReminderAboutSurveyOpeningToTeachers,
}
