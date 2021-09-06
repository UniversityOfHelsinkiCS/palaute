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
      en: `Dear student, the course feedback form for the course ${courseName.en} is now open.
      Please provide feedback on the course so that we can improve teaching and University operations.
      Once you have completed the form, you will see a summary of your feedback. You will be able to edit your feedback as long
      as the form remains open. You can give feedback here: ${urlToGiveFeedbackTo}`,
      fi: `Hyvä opiskelija! Kurssin ${courseName.fi} kurssipalautelomake on nyt auki! 
      Käythän vastaamassa kurssipalautteeseen, jotta voimme kehittää opetusta ja yliopiston toimintaa. 
      Vastattuasi näet palautekoosteen ja voit muokata vastauksia kyselyn ollessa auki.
      Palautetta voit antaa täällä: ${urlToGiveFeedbackTo}`,
      sv: ``,
    },
    subject: {
      en: `Course feedback for course ${courseName.en} has opened`,
      fi: `Kurssin ${courseName.fi} kurssipalaute on avautunut`,
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
      en: `Dear student, The teacher of the course ${courseName.en} has responded to the course feedback
      recieved from students. You can read the teacher's feedback here: ${urlToSeeFeedbackSummary}`,
      fi: `Hyvä opiskelija! Kurssin ${courseName.fi} opettaja on antanut vastapalautteen kurssin opiskelijoilta saadun palautteen perusteella. Voit käydä lukemassa palautteen täältä: ${urlToSeeFeedbackSummary}`,
      sv: '',
    },
    subject: {
      en: `A new counter feedback from your teacher to course ${courseName.en}`,
      fi: `Uusi vastapalaute opettajaltasi kurssilla ${courseName.fi}`,
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
      en: `Dear teacher of the course ${courseName.en}
      The course feedback form will open in a week and will remain open for four weeks. Please add your
      own questions, if any, before the above date. You can add your questions here: ${urlToEditSurvey} . Thank you!`,
      fi: `Hyvä kurssin ${courseName.fi} opettaja! Kurssipalautelomake aukeaa viikon päästä ja on auki neljä viikkoa. Lisääthän mahdolliset omat kysymyksesi ennen sitä. Kysymyksiä voit lisätä täällä: ${urlToEditSurvey}. Kiitos!`,
      sv: '',
    },
    subject: {
      en: `Feedback for the course ${courseName.en} is about to start`,
      fi: `Palautejakso opettamallesi kurssille ${courseName.fi} on alkamassa`,
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
