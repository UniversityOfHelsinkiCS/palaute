const axios = require('axios')
const { format } = require('date-fns')
const { chunk } = require('lodash')

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
  headerFontColor: 'white',
  dryrun: !inProduction || inStaging,
}

const pateClient = axios.create({
  baseURL: 'https://pate.toska.cs.helsinki.fi',
  params: {
    token: process.env.PATE_API_TOKEN,
  },
})

const sendToPate = async (options = {}) => {
  if (!inProduction || inStaging) {
    logger.debug('Skipped sending email in non-production environment', options)
    return null
  }

  /* eslint-disable */

  logger.info(`sending email to: ${options.emails.length}`)

  const chunkedEmails = chunk(options.emails, 50)
  const chunkedOptions = chunkedEmails.map((emails) => ({
    emails,
    settings: options.settings,
    template: options.template,
  }))

  for (chunkedOption of chunkedOptions) {
    await pateClient.post('/', chunkedOption)
  }
  return options
}

/* eslint-enable */

const sendEmail = async (listOfEmails) => {
  const options = {
    template: {
      ...template,
    },
    emails: listOfEmails,
    settings: { ...settings },
  }

  sendToPate(options)
}

const sendNotificationAboutFeedbackSummaryToStudents = (
  urlToSeeFeedbackSummary,
  students,
  courseName,
) => {
  const translations = {
    text: {
      en: `Dear student!\n The teacher of the course ${courseName.en} has responded to the course feedback
      recieved from students. You can read the teacher's feedback here: <a href=${urlToSeeFeedbackSummary}>${courseName.en}</a>`,
      fi: `Hyvä opiskelija!\n Kurssin ${courseName.fi} opettaja on antanut vastapalautteen kurssin opiskelijoilta saadun palautteen perusteella. 
      Voit käydä lukemassa palautteen täältä: <a href=${urlToSeeFeedbackSummary}>${courseName.fi}</a>`,
      sv: `Bästa studerande!\n
      Läraren på kursen ${courseName.sv} har svarat på responsen som kursens studerande har gett.
      Du kan läsa svaret här: <a href=${urlToSeeFeedbackSummary}>${courseName.sv}</a>`,
    },
    subject: {
      en: `A new counter feedback from your teacher to course ${courseName.en}`,
      fi: `Uusi vastapalaute opettajaltasi kurssilla ${courseName.fi}`,
      sv: `Din lärare har gett ett nytt svar till kursresponsen på kursen ${courseName.sv}`,
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

const emailReminderAboutSurveyOpeningToTeachers = (
  emailAddress,
  teacherFeedbackTargets,
) => {
  const hasMultipleFeedbackTargets = teacherFeedbackTargets.length > 1
  const language = teacherFeedbackTargets[0].language
    ? teacherFeedbackTargets[0].language
    : 'en'
  const courseName = teacherFeedbackTargets[0].name[language]

  let courseNamesAndUrls = ''

  /* eslint-disable */

  for (feedbackTarget of teacherFeedbackTargets) {
    const { id, name, opensAt } = feedbackTarget
    const humanDate = format(new Date(opensAt), 'dd.MM.yyyy')
    const openFrom = {
      en: `Opens at ${humanDate}`,
      fi: `Palautejakso alkaa ${humanDate}`,
      sv: `Opens at ${humanDate}`,
    }

    courseNamesAndUrls =
      courseNamesAndUrls +
      `<a href=${`https://coursefeedback.helsinki.fi/targets/${id}/edit`}>
      ${name[language]}
      </a> (${openFrom[language]}) <br/>`
  }

  const translations = {
    text: {
      en: `Dear teacher! <br/>
      The course feedback form for the following courses will open in a week and will remain open for four weeks: <br/>
      ${courseNamesAndUrls}
      Please add your own questions, if any, before the above date. You can add the questions by going through the link. Thank you!`,
      fi: `Hyvä opettaja! <br/> 
      Kurssipalautelomake seuraaville kursseille aukeaa viikon päästä ja on auki neljä viikkoa: <br/>
      ${courseNamesAndUrls}
      Lisääthän mahdolliset omat kysymyksesi ennen sitä. Kysymyksiä voit lisätä linkkien kautta. Kiitos!`,
      sv: `Bästa lärare! <br/>
      Kursresponsblanketten för följande kurser öppnas om en vecka och är öppna fyra veckor: <br/>
      ${courseNamesAndUrls}
      Du kan lägga till egna frågor innan det. Frågor kan läggas till genom länkarna. Tack!`,
    },
    subject: {
      en: hasMultipleFeedbackTargets
        ? `The feedback for your courses are about to start`
        : `Feedback for the course ${courseName} is about to start`,
      fi: hasMultipleFeedbackTargets
        ? `Palautejakso opettamillesi kursseille on alkamassa`
        : `Palautejakso opettamallesi kurssille ${courseName} on alkamassa`,
      sv: hasMultipleFeedbackTargets
        ? `Perioden för kursrespons börjar på dina kurser`
        : `Tidsperioden för kursrespons på kursen ${courseName} börjar`,
    },
  }

  const email = {
    to: emailAddress,
    subject: translations.subject[language] || translations.subject.en,
    text: translations.text[language] || translations.text.en,
  }

  return email
}

const notificationAboutSurveyOpeningToStudents = (
  emailAddress,
  studentFeedbackTargets,
) => {
  const hasMultipleFeedbackTargets = studentFeedbackTargets.length > 1
  const language = studentFeedbackTargets[0].language
    ? studentFeedbackTargets[0].language
    : 'en'
  const courseName = studentFeedbackTargets[0].name[language]

  let courseNamesAndUrls = ''

  /* eslint-disable */

  for (feedbackTarget of studentFeedbackTargets) {
    const { id, name, closesAt } = feedbackTarget
    const humanDate = format(new Date(closesAt), 'dd.MM.yyyy')
    const openUntil = {
      en: `Open until ${humanDate}`,
      fi: `Avoinna ${humanDate} asti`,
      sv: `Open until ${humanDate}`,
    }

    courseNamesAndUrls =
      courseNamesAndUrls +
      `<a href=${`https://coursefeedback.helsinki.fi/targets/${id}/feedback`}>
      ${name[language]}
      </a> (${openUntil[language]}) <br/>`
  }

  const translations = {
    text: {
      en: `Dear student, <br/>
      Course feedback for the following courses are now open: <br/>
      ${courseNamesAndUrls}
      Please provide feedback on the course so that we can improve teaching and University operations.
      Once you have completed the form, you will see a summary of your feedback. You will be able to edit your feedback as long
      as the form remains open.`,
      fi: `Hyvä opiskelija!<br/> Seuraavien kurssien kurssipalautelomakkeet ovat nyt auki:<br/>
      ${courseNamesAndUrls}
      Käythän antamassa kurssipalautetta, jotta voimme kehittää opetusta ja yliopiston toimintaa. 
      Vastattuasi näet palautekoosteen ja voit muokata vastauksia kyselyn ollessa auki.`,
      sv: `Bästa studerande! <br/>
      Kursresponsblanketten för följande kurser är nu öppna: <br/>
      ${courseNamesAndUrls}
      Ge gärna kursrespons, så att vi kan utveckla undervisningen och universitetets verksamhet.
      Efter att du gett din respons kan du se ett sammandrag och du kan ändra dina svar så länge kursresponsen är öppen.`,
    },
    subject: {
      en: hasMultipleFeedbackTargets
        ? `Course feedback has opened`
        : `Course feedback for course ${courseName} has opened`,
      fi: hasMultipleFeedbackTargets
        ? `Kurssipalaute on avautunut`
        : `Kurssin ${courseName} kurssipalaute on avautunut`,
      sv: hasMultipleFeedbackTargets
        ? `Kursresponsen har öppnats`
        : `Kursresponsen för kursen ${courseName} har öppnats`,
    },
  }
  /* eslint-enable */

  const email = {
    to: emailAddress,
    subject: translations.subject[language] || translations.subject.en,
    text: translations.text[language] || translations.text.en,
  }

  return email
}

module.exports = {
  sendNotificationAboutFeedbackSummaryToStudents,
  emailReminderAboutSurveyOpeningToTeachers,
  notificationAboutSurveyOpeningToStudents,
  sendEmail,
}
