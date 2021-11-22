const axios = require('axios')
const { format } = require('date-fns')
const { chunk } = require('lodash')
const jwt = require('jsonwebtoken')

const { inProduction, inStaging } = require('../../config')
const logger = require('./logger')
const { JWT_KEY } = require('./config')

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

const sleep = (time) =>
  new Promise((resolve) => setTimeout(() => resolve(), time))

const sendToPate = async (options = {}) => {
  if (!inProduction || inStaging) {
    logger.debug('Skipped sending email in non-production environment', options)
    return null
  }

  logger.info(`sending email to: ${options.emails.length}`)

  const chunkedEmails = chunk(options.emails, 50)
  const chunkedOptions = chunkedEmails.map((emails) => ({
    emails,
    settings: options.settings,
    template: options.template,
  }))

  for (const chunkedOption of chunkedOptions) {
    await pateClient.post('/', chunkedOption)
    await sleep(1000)
  }

  return options
}

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
  feedbackResponse,
) => {
  const translations = {
    text: {
      en: `Dear student!\n The teacher of the course ${courseName.en} has responded to the course feedback recieved from students. \n 
      Feedback response: ${feedbackResponse}\n
      You can read the course feedbacks here: <a href=${urlToSeeFeedbackSummary}>${courseName.en}</a>`,
      fi: `Hyvä opiskelija!\n Kurssin ${courseName.fi} opettaja on antanut vastapalautteen kurssin opiskelijoilta saadun palautteen perusteella. \n
      Vastapalaute: ${feedbackResponse}\n
      Voit käydä lukemassa kurssin palautteita täältä: <a href=${urlToSeeFeedbackSummary}>${courseName.fi}</a>`,
      sv: `Bästa studerande!\n
      Läraren på kursen ${courseName.sv} har svarat på responsen som kursens studerande har gett. \n
      Svaret: ${feedbackResponse}\n
      Du kan läsa responsen här: <a href=${urlToSeeFeedbackSummary}>${courseName.sv}</a>`,
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

  for (const feedbackTarget of teacherFeedbackTargets) {
    const { id, name, opensAt, closesAt } = feedbackTarget
    const humanOpensAtDate = format(new Date(opensAt), 'dd.MM.yyyy')
    const humanClosesAtDate = format(new Date(closesAt), 'dd.MM.yyyy')

    const openFrom = {
      en: `Open from ${humanOpensAtDate} `,
      fi: `Palautejakso auki ${humanOpensAtDate}`,
      sv: `Öppnas ${humanOpensAtDate} och `,
    }

    const closesOn = {
      en: `to ${humanClosesAtDate}`,
      fi: `- ${humanClosesAtDate}`,
      sv: `stängs ${humanClosesAtDate}`,
    }

    courseNamesAndUrls = `${courseNamesAndUrls}<a href=${`https://coursefeedback.helsinki.fi/targets/${id}/edit`}>
      ${name[language]}
      </a> (${openFrom[language]} ${closesOn[language]}) <br/>`
  }

  const instructionsAndSupport = {
    en: `Contact support: <a href="mailto:coursefeedback@helsinki.fi">coursefeedback@helsinki.fi</a> <br/>
    User instructions: <a href="https://wiki.helsinki.fi/display/CF">https://wiki.helsinki.fi/display/CF</a> <br/>
    <a href="https://flamma.helsinki.fi/en/group/ajankohtaista/news/-/uutinen/opiskelijat-saavat-uuden-tyokalun-kurssipalautteen-antoon/20194526">More information about Norppa in Flamma</a>`,
    fi: `Ota yhteyttä tukeen: <a href="mailto:coursefeedback@helsinki.fi">coursefeedback@helsinki.fi</a> <br/>
    Käyttöohje: <a href="https://wiki.helsinki.fi/display/CF">https://wiki.helsinki.fi/display/CF</a> <br/>
    <a href="https://flamma.helsinki.fi/fi/group/ajankohtaista/uutinen/-/uutinen/opiskelijat-saavat-uuden-tyokalun-kurssipalautteen-antoon/20194526">Lisätietoja Norpasta Flammassa</a>`,
    sv: `Kontakta stödet: <a href="mailto:coursefeedback@helsinki.fi">coursefeedback@helsinki.fi</a> <br/>
    Användarinstruktioner: <a href="https://wiki.helsinki.fi/display/CF">https://wiki.helsinki.fi/display/CF</a> <br/>
    <a href="https://flamma.helsinki.fi/sv/group/ajankohtaista/nyhet/-/uutinen/opiskelijat-saavat-uuden-tyokalun-kurssipalautteen-antoon/20194526">Mer information om Norppa i flamma</a>`,
  }

  const translations = {
    text: {
      en: `Dear teacher! <br/>
      The course feedback form for the following courses will open in a week: <br/>
      ${courseNamesAndUrls}
      Please add your own questions, if any, before the above date. You can add the questions by clicking the course name. Thank you! <br/>
      ${instructionsAndSupport.en}`,
      fi: `Hyvä opettaja! <br/> 
      Kurssipalautelomake seuraaville kursseille aukeaa viikon päästä: <br/>
      ${courseNamesAndUrls}
      Lisääthän mahdolliset omat kysymyksesi ennen palautejakson alkamista. Kysymyksiä voit lisätä klikkaamalla kurssin nimeä. Kiitos!  <br/>
      ${instructionsAndSupport.fi}`,
      sv: `Bästa lärare! <br/>
      Kursresponsblanketten för följande kurser öppnas om en vecka: <br/>
      ${courseNamesAndUrls}
      Du kan lägga till egna frågor innan det. Du kan lägga till frågor med att klicka på kursens namn. Tack! <br/>
      ${instructionsAndSupport.sv}`,
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

const emailReminderAboutFeedbackResponseToTeachers = (
  emailAddress,
  teacherFeedbackTargets,
) => {
  const hasMultipleFeedbackTargets = teacherFeedbackTargets.length > 1
  const language = teacherFeedbackTargets[0].language
    ? teacherFeedbackTargets[0].language
    : 'en'
  const courseName = teacherFeedbackTargets[0].name[language]

  let courseNamesAndUrls = ''

  for (const feedbackTarget of teacherFeedbackTargets) {
    const { id, name } = feedbackTarget

    courseNamesAndUrls = `${courseNamesAndUrls}<a href=${`https://coursefeedback.helsinki.fi/targets/${id}/feedback-response`}>
      ${name[language]}
      </a> <br/>`
  }

  const instructionsAndSupport = {
    en: `Contact support: <a href="mailto:coursefeedback@helsinki.fi">coursefeedback@helsinki.fi</a> <br/>
    User instructions: <a href="https://wiki.helsinki.fi/display/CF">https://wiki.helsinki.fi/display/CF</a> <br/>
    <a href="https://flamma.helsinki.fi/en/group/ajankohtaista/news/-/uutinen/opiskelijat-saavat-uuden-tyokalun-kurssipalautteen-antoon/20194526">More information about Norppa in Flamma</a>`,
    fi: `Ota yhteyttä tukeen: <a href="mailto:coursefeedback@helsinki.fi">coursefeedback@helsinki.fi</a> <br/>
    Käyttöohje: <a href="https://wiki.helsinki.fi/display/CF">https://wiki.helsinki.fi/display/CF</a> <br/>
    <a href="https://flamma.helsinki.fi/fi/group/ajankohtaista/uutinen/-/uutinen/opiskelijat-saavat-uuden-tyokalun-kurssipalautteen-antoon/20194526">Lisätietoja Norpasta Flammassa</a>`,
    sv: `Kontakta stödet: <a href="mailto:coursefeedback@helsinki.fi">coursefeedback@helsinki.fi</a> <br/>
    Användarinstruktioner: <a href="https://wiki.helsinki.fi/display/CF">https://wiki.helsinki.fi/display/CF</a> <br/>
    <a href="https://flamma.helsinki.fi/sv/group/ajankohtaista/nyhet/-/uutinen/opiskelijat-saavat-uuden-tyokalun-kurssipalautteen-antoon/20194526">Mer information om Norppa i flamma</a>`,
  }

  const translations = {
    text: {
      en: `Dear teacher! <br/>
      The feedback period for the following courses is ending: <br/>
      ${courseNamesAndUrls}
      Please give a feedback response for the students. You can give feedback response by clicking the course name. <br/>
      Your response to students is central for creating a feedback culture: it shows students that their feedback is actually read and used, which encourages them to give constructive feedback in the future. <br/>
      Thank you! <br/>
      ${instructionsAndSupport.en}`,
      fi: `Hyvä opettaja! <br/> 
      Palautejakso seuraaville kursseille on päättymässä: <br/>
      ${courseNamesAndUrls}
      Annathan opiskelijoille vastapalautetta. Vastapalautetta voit antaa klikkaamalla kurssin nimeä.  <br/>
      Vastapalautteesi opiskelijoille on keskeistä hyvän palautekulttuurin luomiseen: se näyttää opiskelijoille, että heidän palautteensa on oikeasti luettu ja huomioitu. Tämä kannustaa heitä antamaan rakentavaa palautetta tulevaisuudessakin. <br/>
      Kiitos!  <br/>
      ${instructionsAndSupport.fi}`,
      sv: `Bästa lärare! <br/>
      Kursresponsblanketten för följande kurser öppnas om en vecka: <br/>
      ${courseNamesAndUrls}
      Du kan lägga till egna frågor innan det. Du kan lägga till frågor med att klicka på kursens namn. Tack! <br/>
      ${instructionsAndSupport.sv}`,
    },
    subject: {
      en: hasMultipleFeedbackTargets
        ? `Please give feedback response for your courses`
        : `Please give feedback response for the course ${courseName}`,
      fi: hasMultipleFeedbackTargets
        ? `Annathan vastapalautetta kursseillesi`
        : `Annathan vastapalautetta kurssillesi ${courseName}`,
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
  const { noAdUser, language, name, username } = studentFeedbackTargets[0]
  const hasMultipleFeedbackTargets = studentFeedbackTargets.length > 1

  const emailLanguage = !language ? 'en' : language

  const courseName = name[emailLanguage]
    ? name[emailLanguage]
    : Object.values(name)[0]
  const token = jwt.sign({ username }, JWT_KEY)

  let courseNamesAndUrls = ''

  for (const feedbackTarget of studentFeedbackTargets) {
    const { id, name, closesAt } = feedbackTarget
    const url = noAdUser
      ? `https://coursefeedback.helsinki.fi/noad/token/${token}`
      : `https://coursefeedback.helsinki.fi/targets/${id}/feedback`
    const humanDate = format(new Date(closesAt), 'dd.MM.yyyy')
    const openUntil = {
      en: `Open until ${humanDate}`,
      fi: `Avoinna ${humanDate} asti`,
      sv: `Open until ${humanDate}`,
    }

    courseNamesAndUrls = `${courseNamesAndUrls}<a href=${url}>
      ${name[emailLanguage]}
      </a> (${openUntil[emailLanguage]}) <br/>`
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
  emailReminderAboutFeedbackResponseToTeachers,
  sendEmail,
}
