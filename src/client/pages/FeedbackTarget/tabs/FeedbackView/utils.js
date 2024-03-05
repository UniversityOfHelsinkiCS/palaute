import { parseISO, lightFormat } from 'date-fns'
import _ from 'lodash'

import apiClient from '../../../../util/apiClient'
import { STUDENT_FEEDBACK_QUESTIONS_ORDER_INITIAL } from '../../../../util/common'

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
        errors.answers[questionId] = 'validationErrors:required'
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

/**
 * Merges surveys into one list of questions and orders them properly
 * @param {object} feedbackTarget
 * @returns {object[]} array of questions in correct order
 */
export const getQuestions = feedbackTarget => {
  const { surveys } = feedbackTarget

  if (STUDENT_FEEDBACK_QUESTIONS_ORDER_INITIAL) {
    const uniOpenQuestions = surveys?.universitySurvey?.questions
    const programmeSurveyQuestions = surveys.programmeSurveys.reduce(
      (questions, survey) => questions.concat(survey.questions),
      []
    )
    const teacherQuestions = surveys?.teacherSurvey?.questions ?? []
    const [groupingQuestions, otherTeacherQuestions] = _.partition(
      teacherQuestions,
      q => q.secondaryType === 'GROUPING'
    )

    // Initial ordering
    const allQuestionsInInitialOrder = [
      ...groupingQuestions,
      ...uniOpenQuestions,
      ...programmeSurveyQuestions,
      ...otherTeacherQuestions,
    ]

    return allQuestionsInInitialOrder
  }

  const uniOpenQuestions = surveys?.universitySurvey?.questions.filter(q => q.type === 'OPEN') ?? []
  const filteredUniQuestions = surveys?.universitySurvey?.questions.filter(q => q.type !== 'OPEN') ?? []

  const programmeSurveyQuestions = surveys.programmeSurveys.reduce(
    (questions, survey) => questions.concat(survey.questions),
    []
  )

  const programmeOpenQuestions = programmeSurveyQuestions.filter(q => q.type === 'OPEN')
  const filteredProgrammeQuestions = programmeSurveyQuestions.filter(q => q.type !== 'OPEN')

  const teacherQuestions = surveys?.teacherSurvey?.questions ?? []
  const [groupingQuestions, otherTeacherQuestions] = _.partition(teacherQuestions, q => q.secondaryType === 'GROUPING')

  // Default ordering
  const allQuestions = [
    ...groupingQuestions,
    ...filteredUniQuestions,
    ...(filteredProgrammeQuestions ?? []),
    ...otherTeacherQuestions,
    ...programmeOpenQuestions,
    ...uniOpenQuestions,
  ]

  return allQuestions
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
