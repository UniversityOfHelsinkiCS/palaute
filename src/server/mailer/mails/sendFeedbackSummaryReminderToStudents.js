const { format } = require('date-fns')
const { pate } = require('../pateClient')

const buildNotificationAboutFeedbackResponseToStudents = (
  courseName,
  startDate,
  endDate,
  urlToSeeFeedbackSummary,
  feedbackResponse
) => {
  const dates = `(${format(startDate, 'dd.MM')} - ${format(endDate, 'dd.MM.yyyy')})`
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

const sendNotificationAboutFeedbackResponseToStudents = async (
  urlToSeeFeedbackSummary,
  students,
  courseName,
  startDate,
  endDate,
  feedbackResponse
) => {
  const translations = buildNotificationAboutFeedbackResponseToStudents(
    courseName,
    startDate,
    endDate,
    urlToSeeFeedbackSummary,
    feedbackResponse
  )

  const emails = students.map(student => {
    const email = {
      to: student.email,
      subject: translations.subject[student.language] || translations.subject.en,
      text: translations.text[student.language] || translations.text.en,
    }
    return email
  })

  await pate.send(emails, 'Notify students about counter feedback')

  return emails
}

const sendFeedbackSummaryReminderToStudents = async (feedbackTarget, feedbackResponse) => {
  const courseUnit = await feedbackTarget.getCourseUnit()
  const cr = await feedbackTarget.getCourseRealisation()
  const students = await feedbackTarget.getStudentsForFeedbackTarget()
  const url = `https://coursefeedback.helsinki.fi/targets/${feedbackTarget.id}/results`
  const formattedStudents = students
    .filter(student => student.email)
    .map(student => ({
      email: student.email,
      language: student.language || 'en',
    }))
  return sendNotificationAboutFeedbackResponseToStudents(
    url,
    formattedStudents,
    courseUnit.name,
    cr.startDate,
    cr.endDate,
    feedbackResponse
  )
}

module.exports = { sendFeedbackSummaryReminderToStudents }
