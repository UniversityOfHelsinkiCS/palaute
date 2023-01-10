import { parseISO, lightFormat } from 'date-fns'

import apiClient from '../../../../util/apiClient'

const isEmpty = value => {
  if (Array.isArray(value)) {
    return value.length === 0
  }

  if (typeof value === 'number') {
    return false
  }

  return !value
}

export const makeValidate = questions => {
  const questionById = new Map()

  questions.forEach(q => {
    questionById.set(q.id.toString(), q)
  })

  return values => {
    const errors = {}

    Object.entries(values.answers).forEach(([questionId, answer]) => {
      const question = questionById.get(questionId)
      const hasError = question.required && isEmpty(answer)

      if (hasError) {
        errors.answers = errors.answers ?? {}
        errors.answers[questionId] = 'validationErrors.required'
      }
    })

    return errors
  }
}

const getInitialAnswerByType = type => {
  if (type === 'MULTIPLE_CHOICE') {
    return []
  }

  return ''
}

export const getQuestions = feedbackTarget => {
  const { surveys } = feedbackTarget

  const uniOpenQuestions = surveys?.universitySurvey?.questions.filter(q => q.type === 'OPEN') ?? []
  const filteredUniQuestions = surveys?.universitySurvey?.questions.filter(q => q.type !== 'OPEN') ?? []

  const programmeSurveyQuestions = surveys.programmeSurveys.reduce(
    (questions, survey) => questions.concat(survey.questions),
    []
  )

  return [
    ...filteredUniQuestions,
    ...(programmeSurveyQuestions ?? []),
    ...(surveys?.teacherSurvey?.questions ?? []),
    ...uniOpenQuestions,
  ]
}

const getInitialAnswerByFeedback = (feedback, question) => {
  const { id } = question

  const questionAnswer = feedback?.data.find(({ questionId }) => questionId === id)

  return questionAnswer?.data
}

export const getInitialValues = feedbackTarget => {
  const questions = getQuestions(feedbackTarget)

  const answers = questions
    .filter(q => q.type !== 'TEXT')
    .reduce(
      (acc, question) => ({
        ...acc,
        [question.id]:
          getInitialAnswerByFeedback(feedbackTarget.feedback, question) ?? getInitialAnswerByType(question.type),
      }),
      {}
    )

  return { answers }
}

export const saveValues = async (values, feedbackTarget) => {
  const { answers } = values

  const feedbackData = Object.entries(answers).map(([questionId, data]) => ({
    questionId: Number(questionId),
    data,
  }))

  const { id: feedbackTargetId, feedback } = feedbackTarget

  if (feedback) {
    const { data } = await apiClient.put(`/feedbacks/${feedback.id}`, {
      data: feedbackData,
    })

    return data
  }

  const { data } = await apiClient.post('/feedbacks', {
    feedbackTargetId,
    data: feedbackData,
  })

  return data
}

export const saveContinuousFeedback = async (values, feedbackTargetId) => {
  const { feedback } = values

  const { data } = await apiClient.post(`/continuous-feedback/${feedbackTargetId}`, {
    feedback,
  })

  return data
}

export const formatDate = date => lightFormat(date, 'd.M.yyyy')

export const checkIsFeedbackOpen = date => new Date() > parseISO(date)

export const feedbackTargetIsDisabled = feedbackTarget => {
  const { courseUnit } = feedbackTarget
  const organisations = courseUnit?.organisations ?? []

  return organisations.some(({ disabledCourseCodes }) => disabledCourseCodes.includes(courseUnit.courseCode))
}
