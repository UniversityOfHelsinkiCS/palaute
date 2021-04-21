import { isAfter, parseISO, lightFormat } from 'date-fns'
import apiClient from '../../util/apiClient'

const pickerDateFormat = `yyyy-MM-dd'T'hh:mm`

const formatPickerDate = (date) => lightFormat(date, pickerDateFormat)

export const getInitialValues = (feedbackTarget, surveys) => {
  const { hidden, closesAt, opensAt, name } = feedbackTarget
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

export const saveValues = async (values, surveys, id) => {
  const { questions, hidden, name } = values

  const closesAt = values.closesAt ? new Date(values.closesAt) : null
  const opensAt = values.opensAt ? new Date(values.opensAt) : null

  const { id: surveyId, data: surveyData } = surveys.teacherSurvey

  const payload = {
    data: surveyData,
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
