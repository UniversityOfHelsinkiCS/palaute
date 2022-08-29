const { format } = require('date-fns')

/* eslint-disable max-len */
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

const buildReminderAboutSurveyOpeningToTeachers = (
  courseNamesAndUrls,
  courseName,
  hasMultipleFeedbackTargets,
) => {
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

  return translations
}

const buildNotificationAboutFeedbackResponseToStudents = (
  courseName,
  startDate,
  endDate,
  urlToSeeFeedbackSummary,
  feedbackResponse,
) => {
  const dates = `(${format(startDate, 'dd.MM')} - ${format(
    endDate,
    'dd.MM.yyyy',
  )})`
  const translations = {
    text: {
      en: `Dear student!\n The teacher of the course ${courseName.en} ${dates} has responded to the course feedback recieved from students. \n 
          Counter feedback: ${feedbackResponse}\n
          You can read the course feedbacks here: <a href=${urlToSeeFeedbackSummary}>${courseName.en}</a>`,
      fi: `Hyvä opiskelija!\n Kurssin ${courseName.fi} ${dates} opettaja on antanut vastapalautteen kurssin opiskelijoilta saadun palautteen perusteella. \n
          Vastapalaute: ${feedbackResponse}\n
          Voit käydä lukemassa kurssin palautteita täältä: <a href=${urlToSeeFeedbackSummary}>${courseName.fi}</a>`,
      sv: `Bästa studerande!\n
          Läraren på kursen ${courseName.sv} ${dates} har svarat på responsen som kursens studerande har gett. \n
          Svaret: ${feedbackResponse}\n
          Du kan läsa responsen här: <a href=${urlToSeeFeedbackSummary}>${courseName.sv}</a>`,
    },
    subject: {
      en: `A new counter feedback from your teacher to course ${courseName.en}`,
      fi: `Uusi vastapalaute opettajaltasi kurssilla ${courseName.fi}`,
      sv: `Din lärare har gett ett nytt svar till kursresponsen på kursen ${courseName.sv}`,
    },
  }

  return translations
}

const buildReminderToGiveFeedbackToStudents = (
  urlToGiveFeedback,
  courseName,
  reminder,
  closesAt,
) => {
  const translations = {
    text: {
      en: `Dear student!\n 
          Please give feedback for the course <a href=${urlToGiveFeedback}>${courseName.en}</a>. 
          The feedback period ends on ${closesAt}. \n
          ${reminder}`,
      fi: `Hyvä opiskelija!\n 
          Vastaathan kurssin <a href=${urlToGiveFeedback}>${courseName.fi}</a> palautteeseen.
          Palautejakso päättyy ${closesAt}. \n 
          ${reminder}`,
      sv: `Bästa studerande!\n
          Ge gärna respons på kursen <a href=${urlToGiveFeedback}>${courseName.sv}</a>. 
          Responsperioden tar slut ${closesAt}. \n
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

const buildReminderAboutFeedbackResponseToTeachers = (
  courseNamesAndUrls,
  courseName,
  hasMultipleFeedbackTargets,
  receivedBy,
) => {
  const teachers = receivedBy
    .map((u) => `${u.firstName} ${u.lastName}`)
    .join(', ')
  const translations = {
    text: {
      en: `Dear teacher! <br/>
          The feedback period for the following courses has ended: <br/>
          ${courseNamesAndUrls}
          Please give counter feedback for the students. You can give counter feedback by clicking the course name. <br/>
          Your response to students is central for creating a feedback culture: it shows students that their feedback is actually read and used, which encourages them to give constructive feedback in the future. Counter feedback is sent to all students of the course. <br/>
          Thank you! <br/>
          ${instructionsAndSupport.en}`,
      fi: `Hyvä opettaja! <br/> 
          Palautejakso seuraaville kursseille on päättynyt: <br/>
          ${courseNamesAndUrls}
          Annathan opiskelijoille vastapalautetta. Vastapalautetta voit antaa klikkaamalla kurssin nimeä.  <br/>
          Vastapalautteesi opiskelijoille on keskeistä hyvän palautekulttuurin luomiseen: se näyttää opiskelijoille, että heidän palautteensa on oikeasti luettu ja huomioitu. Tämä kannustaa heitä antamaan rakentavaa palautetta tulevaisuudessakin. Vastapalaute lähetetään kaikille kurssin opiskelijoille. <br/>
          Kiitos!  <br/>
          ${instructionsAndSupport.fi} <br/>
          Lähetetty opettajille ${teachers}`,
      sv: `Bästa lärare! <br/>
          Responsperioden för följande kurser har tagit slut: <br/>
          ${courseNamesAndUrls}
          Ge gärna studerandena respons tillbaka. Du kan ge motrespons genom att klicka på kursens namn. <br/>
          Ditt svar till studerandena är centralt i skapandet av en bra responskultur: det visar studerandena att deras respons faktiskt läses och beaktas. Det här uppmuntrar dem att ge konstruktiv feedback i framtiden. Responsen kommer att skickas till alla studenter i kursen. <br/>
          Tack! <br/>
          ${instructionsAndSupport.sv}`,
    },
    subject: {
      en: hasMultipleFeedbackTargets
        ? `Please give counter feedback for your courses`
        : `Please give counter feedback for the course ${courseName}`,
      fi: hasMultipleFeedbackTargets
        ? `Annathan vastapalautetta kursseillesi`
        : `Annathan vastapalautetta kurssillesi ${courseName}`,
      sv: hasMultipleFeedbackTargets
        ? `Ge gärna motrespons för dina kurser`
        : `Ge gärna motrespons för kursen ${courseName}`,
    },
  }

  return translations
}

const buildNotificationAboutSurveyOpeningToStudents = (
  courseNamesAndUrls,
  courseName,
  hasMultipleFeedbackTargets,
) => {
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

  return translations
}

module.exports = {
  buildNotificationAboutFeedbackResponseToStudents,
  buildReminderToGiveFeedbackToStudents,
  buildReminderAboutSurveyOpeningToTeachers,
  buildReminderAboutFeedbackResponseToTeachers,
  buildNotificationAboutSurveyOpeningToStudents,
}
