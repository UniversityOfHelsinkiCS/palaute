import { lightFormat } from 'date-fns'
import apiClient from '../../util/apiClient'

const formatPickerDate = (date) => lightFormat(date, `yyyy-MM-dd'T'hh:mm`)

export const getInitialValues = (feedbackTarget, surveys) => {
  const { hidden, closesAt, opensAt, name } = feedbackTarget
  const questions = surveys?.teacherSurvey?.questions ?? []

  return {
    name: name.fi,
    hidden: hidden ?? false,
    questions,
    opensAt: formatPickerDate(new Date(opensAt)),
    closesAt: formatPickerDate(new Date(closesAt)),
  }
}

export const validate = (values) => {
  const errors = {}

  if (!values.name) {
    errors.name = 'validationErrors.required'
  }

  if (!values.closesAt) {
    errors.closesAt = 'validationErrors.required'
  }

  if (!values.opensAt) {
    errors.opensAt = 'validationErrors.required'
  }

  return errors
}

export const saveValues = async (values, surveys) => {
  const { questions } = values
  const { id: surveyId, data: surveyData } = surveys.teacherSurvey

  const payload = {
    data: surveyData,
    questions,
  }

  const { data } = await apiClient.put(`/surveys/${surveyId}`, payload)

  return data
}
