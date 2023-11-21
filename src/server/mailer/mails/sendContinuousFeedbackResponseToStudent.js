const { format } = require('date-fns')
const { Op } = require('sequelize')

const { ContinuousFeedback, FeedbackTarget, CourseRealisation, User } = require('../../models')
const { PUBLIC_URL } = require('../../util/config')
const { pate } = require('../pateClient')
const { i18n } = require('../../util/i18n')

const getStudentWithContinuousFeedbackResponse = async continuousFeedbackId => {
  const continuousFeedback = await ContinuousFeedback.findByPk(continuousFeedbackId, {
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
  })

  return continuousFeedback
}

const emailContinuousFeedbackResponseToStudent = continuousFeedback => {
  const { response, user, feedback_target: feedbackTarget } = continuousFeedback
  const { language, email: studentEmail } = user
  const { name, startDate, endDate } = feedbackTarget.courseRealisation

  const dates = `(${format(startDate, 'dd.MM')} - ${format(endDate, 'dd.MM.yyyy')})`

  const url = `${PUBLIC_URL}/targets/${feedbackTarget.id}/continuous-feedback`

  const t = i18n.getFixedT(language)

  const email = {
    to: studentEmail,
    subject: t('mails:continuousFeedbackResponse:subject', { courseName: name[language ?? 'en'] }),
    text: t('mails:continuousFeedbackResponse:text', { courseName: name[language ?? 'en'], response, dates, url }),
  }

  return email
}

const sendEmailContinuousFeedbackResponseToStudent = async continuousFeedbackId => {
  const continuousFeedback = await getStudentWithContinuousFeedbackResponse(continuousFeedbackId)

  const emailToBeSent = emailContinuousFeedbackResponseToStudent(continuousFeedback)

  ContinuousFeedback.update(
    {
      responseEmailSent: true,
    },
    {
      where: {
        id: continuousFeedbackId,
      },
    }
  )

  await pate.send([emailToBeSent], 'Send continuous feedback response to student')

  return emailToBeSent
}

module.exports = { sendEmailContinuousFeedbackResponseToStudent }
