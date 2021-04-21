import { lightFormat } from 'date-fns'
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

  return errors
}

export const saveValues = async (values, surveys) => {
  const { questions, hidden, name } = values

  const closesAt = values.closesAt ? new Date(values.closesAt) : null
  const opensAt = values.opensAt ? new Date(values.opensAt) : null

  const { id: surveyId, data: surveyData } = surveys.teacherSurvey

  const payload = {
    data: surveyData,
    questions,
  }

  const { data } = await apiClient.put(`/surveys/${surveyId}`, payload)

  return data
}
