import { isAfter, set, isBefore } from 'date-fns'
import apiClient from '../../util/apiClient'

const setClosesAt = (date) => set(date, { hours: 23, minutes: 59, seconds: 59 })

const setOpensAt = (date) => set(date, { hours: 0, minutes: 0, seconds: 0 })

export const getInitialValues = (feedbackTarget) => {
  const { hidden, closesAt, opensAt, name, surveys } = feedbackTarget

  const questions = [
    ...(surveys.universitySurvey?.questions ?? []).map((question) => ({
      ...question,
      editable: false,
      chip: 'questionEditor:universityQuestion',
    })),
    ...(surveys.programmeSurvey?.questions ?? []).map((question) => ({
      ...question,
      editable: false,
      chip: 'questionEditor:programmeQuestion',
    })),
    ...(surveys.teacherSurvey?.questions ?? []).map((question) => ({
      ...question,
      editable: true,
    })),
  ]

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
  const { universitySurvey, programmeSurvey } = feedbackTarget.surveys ?? {}

  return [
    ...(universitySurvey?.questions ?? []),
    ...(programmeSurvey?.questions ?? []),
  ]
}

export const requiresSaveConfirmation = (values) =>
  values.opensAt && isBefore(values.opensAt, new Date())

export const saveValues = async (values, feedbackTarget) => {
  const { questions, hidden, name } = values

  const closesAt = values.closesAt
    ? setClosesAt(new Date(values.closesAt))
    : null

  const opensAt = values.opensAt ? setOpensAt(new Date(values.opensAt)) : null

  const { surveys, id } = feedbackTarget
  const { id: surveyId } = surveys.teacherSurvey

  const editableQuestions = questions.filter(({ editable }) => editable)

  const payload = {
    surveyId,
    questions: editableQuestions,
    name,
    hidden,
    closesAt,
    opensAt,
  }

  const { data } = await apiClient.put(`/feedback-targets/${id}`, payload)

  return data
}
