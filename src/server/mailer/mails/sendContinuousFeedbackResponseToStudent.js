const { format } = require('date-fns')
const { Op } = require('sequelize')

const {
  ContinuousFeedback,
  FeedbackTarget,
  CourseRealisation,
  User,
} = require('../../models')
const logger = require('../../util/logger')
const { pate } = require('../pateClient')

const getStudentWithContinuousFeedbackResponse = async (
  continuousFeedbackId,
) => {
  const continuousFeedback = await ContinuousFeedback.findByPk(
    continuousFeedbackId,
    {
      where: {
        response: {
          [Op.ne]: null,
        },
        responseEmailSent: false,
      },
      attributes: ['id', 'response'],
      include: [
        {
          model: FeedbackTarget,
          as: 'feedback_target',
          attributes: ['id'],
          required: true,
          include: [
            {
              model: CourseRealisation,
              as: 'courseRealisation',
              attributes: ['id', 'name', 'startDate', 'endDate'],
              required: true,
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'secondaryEmail', 'language'],
          required: true,
        },
      ],
    },
  )

  return continuousFeedback
}

const buildContinuousFeedbackResponsesToStudents = (
  courseName,
  continuousFeedbackResponse,
  dates,
  urlToSeeContinuousFeedback,
) => {
  const translations = {
    text: {
      en: `Dear student!\n The teacher of the course ${courseName.en} ${dates} has responded to your continuous feedback. \n 
      Response: ${continuousFeedbackResponse}\n
      You can read the response here: <a href=${urlToSeeContinuousFeedback}>${courseName.en}</a>`,
      fi: `Hyvä opiskelija!\n Kurssin ${courseName.fi} ${dates} opettaja on vastannut antaamaasi jatkuvaan palautteeseen. \n
      Vastaus: ${continuousFeedbackResponse}\n
      Voit käydä lukemassa vastauksen täältä: <a href=${urlToSeeContinuousFeedback}>${courseName.fi}</a>`,
      sv: `Dear student!\n The teacher of the course ${courseName.en} ${dates} has responded to your continuous feedback. \n 
      Response: ${continuousFeedbackResponse}\n
      You can read the response here: <a href=${urlToSeeContinuousFeedback}>${courseName.en}</a>`,
    },
    subject: {
      en: `Response to your continuous feedback on course ${courseName.en}`,
      fi: `Vastaus jatkuvaan palautteeseesi kurssilla ${courseName.fi}`,
      sv: `Response to your continuous feedback on course ${courseName.en}`,
    },
  }

  return translations
}

const emailContinuousFeedbackResponseToStudent = (continuousFeedback) => {
  const { response, user, feedback_target: feedbackTarget } = continuousFeedback
  const { language, email: studentEmail } = user
  const { name, startDate, endDate } = feedbackTarget.courseRealisation

  const dates = `(${format(startDate, 'dd.MM')} - ${format(
    endDate,
    'dd.MM.yyyy',
  )})`

  const url = `https://coursefeedback.helsinki.fi/targets/${feedbackTarget.id}/continuous-feedback`

  const translations = buildContinuousFeedbackResponsesToStudents(
    name,
    response,
    dates,
    url,
  )

  const email = {
    to: studentEmail,
    subject: translations.subject[language] || translations.subject.en,
    text: translations.text[language] || translations.text.en,
  }

  return email
}

const sendEmailContinuousFeedbackResponseToStudent = async (
  continuousFeedbackId,
) => {
  const continuousFeedback = await getStudentWithContinuousFeedbackResponse(
    continuousFeedbackId,
  )

  const emailToBeSent =
    emailContinuousFeedbackResponseToStudent(continuousFeedback)

  ContinuousFeedback.update(
    {
      responseEmailSent: true,
    },
    {
      where: {
        id: continuousFeedbackId,
      },
    },
  )

  await pate.send(
    [emailToBeSent],
    'Send continuous feedback response to student',
  )

  return emailToBeSent
}

module.exports = { sendEmailContinuousFeedbackResponseToStudent }
