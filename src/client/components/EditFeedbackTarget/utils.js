import { isAfter, parseISO, lightFormat, set } from 'date-fns'
import apiClient from '../../util/apiClient'

const pickerDateFormat = `yyy-MM-dd`

const formatPickerDate = (date) => lightFormat(date, pickerDateFormat)

const setClosesAt = (date) => set(date, { hours: 23, minutes: 59, seconds: 59 })
const setOpensAt = (date) => set(date, { hours: 0, minutes: 0, seconds: 0 })

export const getInitialValues = (feedbackTarget) => {
  const { hidden, closesAt, opensAt, name, surveys } = feedbackTarget
  const questions = surveys?.teacherSurvey?.questions ?? []

  return {
    name,
    hidden: hidden ?? false,
    questions,
    opensAt: formatPickerDate(new Date(opensAt)),
    closesAt: formatPickerDate(new Date(closesAt)),
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

  if (!isAfter(parseISO(values.closesAt), parseISO(values.opensAt))) {
    errors.closesAt = 'Survey closing date is before opening date'
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
