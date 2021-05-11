import { isAfter, set } from 'date-fns'
import apiClient from '../../util/apiClient'

const setClosesAt = (date) => set(date, { hours: 23, minutes: 59, seconds: 59 })
const setOpensAt = (date) => set(date, { hours: 0, minutes: 0, seconds: 0 })

export const getInitialValues = (feedbackTarget) => {
  const { hidden, closesAt, opensAt, name, surveys } = feedbackTarget
  const questions = surveys?.teacherSurvey?.questions ?? []

  return {
    name,
    hidden: hidden ?? false,
    questions,
    opensAt: new Date(opensAt),
    closesAt: new Date(closesAt),
  }
}

export const validate = (values) => {
  const errors = {}

  if (!values.closesAt) {
    errors.closesAt = 'validationErrors.required'
  }

  if (!values.opensAt) {
    errors.opensAt = 'validationErrors.required'
  }

  if (!isAfter(values.closesAt, values.opensAt)) {
    errors.closesAt = 'validationErrors.wrongDate'
  }

  return errors
}

export const getUpperLevelQuestions = (feedbackTarget) => {
  const { universitySurvey, departmentSurvey } = feedbackTarget.surveys ?? {}

  return [
    ...(universitySurvey?.questions ?? []),
    ...(departmentSurvey?.questions ?? []),
  ]
}

export const checkDate = (opensAt) => isAfter(opensAt, new Date())

export const saveValues = async (values, feedbackTarget) => {
  const { questions, hidden, name } = values

  const closesAt = values.closesAt
    ? setClosesAt(new Date(values.closesAt))
    : null
  const opensAt = values.opensAt ? setOpensAt(new Date(values.opensAt)) : null

  const { surveys, id } = feedbackTarget
  const { id: surveyId } = surveys.teacherSurvey

  const payload = {
    surveyId,
    name,
    hidden,
    closesAt,
    opensAt,
    questions,
  }

  const { data } = await apiClient.put(`/feedback-targets/${id}`, payload)

  return data
}
