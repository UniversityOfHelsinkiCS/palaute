import { format } from 'date-fns'

import { ContinuousFeedback, FeedbackTarget, CourseRealisation, User, CourseUnit } from '../../models'
import { PUBLIC_URL } from '../../util/config'
import { pate } from '../pateClient'
import { i18n } from '../../util/i18n'
import { getLanguageValue } from '../../util/languageUtils'

const getStudentWithContinuousFeedbackResponse = async (continuousFeedbackId: number) => {
  const continuousFeedback = await ContinuousFeedback.findByPk(continuousFeedbackId, {
    attributes: ['id', 'response'],
    include: [
      {
        model: FeedbackTarget,
        as: 'feedbackTarget',
        attributes: ['id'],
        required: true,
        include: [
          {
            model: CourseRealisation,
            as: 'courseRealisation',
            attributes: ['id', 'name', 'startDate', 'endDate'],
            required: true,
          },
          {
            model: CourseUnit,
            as: 'courseUnit',
            attributes: ['id', 'courseCode'],
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

const emailContinuousFeedbackResponseToStudent = (continuousFeedback: ContinuousFeedback) => {
  const { response, user, feedbackTarget } = continuousFeedback
  const { language, email: studentEmail } = user
  const { name, startDate, endDate } = feedbackTarget.courseRealisation
  const { courseCode } = feedbackTarget.courseUnit

  const dates = `(${format(startDate, 'dd.MM')} - ${format(endDate, 'dd.MM.yyyy')})`

  const url = `${PUBLIC_URL}/targets/${feedbackTarget.id}/continuous-feedback`

  const t = i18n.getFixedT(language)

  const email = {
    to: studentEmail,
    subject: t('mails:continuousFeedbackResponse:subject', {
      courseName: getLanguageValue(name, language),
      courseCode,
    }),
    text: t('mails:continuousFeedbackResponse:text', {
      courseName: getLanguageValue(name, language),
      response,
      dates,
      url,
      courseCode,
    }),
  }

  return email
}

export const sendEmailContinuousFeedbackResponseToStudent = async (continuousFeedbackId: number) => {
  const continuousFeedback = await getStudentWithContinuousFeedbackResponse(continuousFeedbackId)
  if (continuousFeedback.response === null || continuousFeedback.responseEmailSent) {
    return null
  }

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
