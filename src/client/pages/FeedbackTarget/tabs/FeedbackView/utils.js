import { useMutation } from '@tanstack/react-query'
import { parseISO, lightFormat } from 'date-fns'
import { isEqualWith, partition } from 'lodash-es'

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
  const { surveys } = feedbackTarget ?? {}

  if (STUDENT_FEEDBACK_QUESTIONS_ORDER_INITIAL) {
    const uniOpenQuestions = surveys?.universitySurvey?.questions ?? []
    const programmeSurveyQuestions = (surveys?.programmeSurveys ?? []).reduce(
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

  const uniOpenQuestions = surveys?.universitySurvey?.questions?.filter(q => q.type === 'OPEN') ?? []
  const filteredUniQuestions = surveys?.universitySurvey?.questions?.filter(q => q.type !== 'OPEN') ?? []

  const programmeSurveyQuestions = (surveys?.programmeSurveys ?? []).reduce(
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

export const getInitialValues = (questions, feedback) => {
  const answers = questions
    .filter(q => q.type !== 'TEXT')
    .reduce(
      (acc, question) => ({
        ...acc,
        [question.id]: getInitialAnswerByFeedback(feedback, question) ?? getInitialAnswerByType(question.type),
      }),
      {}
    )

  return { answers }
}

/*
 * Unsent answers are kept in sessionStorage so that they survive a page reload.
 */
export const getDraftKey = (userId, formId) => `feedbackDraft:${userId}:${formId}`

export const loadDraft = key => {
  try {
    const draft = JSON.parse(sessionStorage.getItem(key))
    return draft && typeof draft === 'object' ? draft : null
  } catch {
    // Storage can be unavailable (e.g. blocked by browser settings) or hold invalid JSON
    return null
  }
}

export const saveDraft = (key, answers) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(answers))
  } catch {
    // Saving a draft is a convenience, so a failure is ignored
  }
}

export const clearDraft = key => {
  try {
    sessionStorage.removeItem(key)
  } catch {
    // See saveDraft
  }
}

/**
 * Applies draft answers on top of the form's answers. Answers to questions that no longer
 * exist, or whose shape no longer matches (the survey may have been edited), are dropped.
 * @returns {object|null} the merged answers, or null if the draft had nothing usable
 */
export const mergeDraft = (answers, draft) => {
  if (!draft) return null

  const usable = Object.entries(draft).filter(
    ([questionId, value]) => questionId in answers && Array.isArray(value) === Array.isArray(answers[questionId])
  )

  if (usable.length === 0) return null

  return { ...answers, ...Object.fromEntries(usable) }
}

/**
 * Compares two sets of answers. Multiple-choice answers are arrays of option ids, and their
 * order depends on the order the options were ticked, so arrays are compared without order.
 */
export const answersEqual = (a, b) =>
  isEqualWith(a, b, (x, y) => {
    if (Array.isArray(x) && Array.isArray(y)) {
      return x.length === y.length && x.every(item => y.includes(item))
    }
    // undefined lets isEqualWith compare everything else as isEqual would
    return undefined
  })

export const useSaveValues = () => {
  const { feedbackTarget } = useFeedbackTargetContext()

  const mutation = useMutation({
    mutationFn: async feedback => {
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
    onSuccess: feedback => {
      queryClient.setQueryData(['feedbackTarget', String(feedbackTarget.id)], feedbackTarget => ({
        ...feedbackTarget,
        feedback,
      }))

      // Invalidate the waiting feedback count for the student
      queryClient.invalidateQueries(['myFeedbacksWaitingFeedbackCount'])
      // Invalidate the feedbackTarget data
      queryClient.invalidateQueries(['feedbackTarget', String(feedbackTarget.id)])
    },
  })

  return mutation
}

export const formatDate = date => lightFormat(date, 'd.M.yyyy')

export const checkIsFeedbackOpen = date => new Date() > parseISO(date)
