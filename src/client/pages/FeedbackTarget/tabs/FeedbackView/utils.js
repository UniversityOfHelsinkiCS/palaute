import { parseISO, lightFormat } from 'date-fns'
import { partition } from 'lodash-es'
import { useMutation } from 'react-query'

import apiClient from '../../../../util/apiClient'
import { STUDENT_FEEDBACK_QUESTIONS_ORDER_INITIAL } from '../../../../util/common'
import queryClient from '../../../../util/queryClient'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'

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
    const [groupingQuestions, otherTeacherQuestions] = partition(teacherQuestions, q => q.secondaryType === 'GROUPING')

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
  const [groupingQuestions, otherTeacherQuestions] = partition(teacherQuestions, q => q.secondaryType === 'GROUPING')

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

export const useSaveValues = () => {
  const { feedbackTarget } = useFeedbackTargetContext()

  const mutation = useMutation(
    async feedback => {
      if (feedbackTarget.feedback) {
        const { data } = await apiClient.put(`/feedbacks/${feedbackTarget.feedback.id}`, {
          data: feedback,
        })

        return data
      }

      const { data } = await apiClient.post('/feedbacks', {
        feedbackTargetId: feedbackTarget.id,
        data: feedback,
      })

      return data
    },
    {
      onSuccess: () => {
        // Invalidate the waiting feedback count for the student
        queryClient.invalidateQueries('myFeedbacksWaitingFeedbackCount')
        // Invalidate the feedbackTarget data
        queryClient.invalidateQueries(['feedbackTarget', String(feedbackTarget.id)])
      },
    }
  )

  return mutation
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
