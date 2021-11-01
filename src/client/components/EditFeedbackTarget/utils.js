import { isAfter, differenceInDays, startOfDay, endOfDay } from 'date-fns'

import apiClient from '../../util/apiClient'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import { copyQuestion } from '../QuestionEditor/utils'

export const getUpperLevelQuestions = (feedbackTarget) => {
  const { universitySurvey, programmeSurvey } = feedbackTarget.surveys ?? {}

  return [
    ...(universitySurvey?.questions ?? []),
    ...(programmeSurvey?.questions ?? []),
  ]
}

export const openFeedbackImmediately = async (feedbackTarget) => {
  const { id } = feedbackTarget
  const opensAt = new Date()

  const payload = {
    opensAt,
  }

  const { data } = await apiClient.put(
    `/feedback-targets/${id}/open-immediately`,
    payload,
  )

  return data
}

export const validateFeedbackPeriod = (values) => {
  const { closesAt, opensAt } = values

  const errors = {}

  if (!closesAt) {
    errors.closesAt = 'validationErrors.required'
  }

  if (!opensAt) {
    errors.opensAt = 'validationErrors.required'
  }

  if (startOfDay(opensAt) < startOfDay(new Date())) {
    errors.opensAt = 'editFeedbackTarget:opensAtInPastError'
  }

  if (!isAfter(closesAt, opensAt)) {
    errors.closesAt = 'editFeedbackTarget:closesAtBeforeOpensAtError'
  }

  if (
    opensAt &&
    closesAt &&
    Math.abs(differenceInDays(opensAt, closesAt)) < 1
  ) {
    errors.closesAt = 'editFeedbackTarget:tooShortFeedbackPeriodError'
  }

  return errors
}

export const opensAtIsImmediately = (values) => {
  const { opensAt } = values

  return startOfDay(opensAt).getTime() === startOfDay(new Date()).getTime()
}

export const requiresSubmitConfirmation = (values) =>
  opensAtIsImmediately(values)

export const getFeedbackPeriodInitialValues = (feedbackTarget) => {
  const { closesAt, opensAt } = feedbackTarget

  return {
    opensAt: new Date(opensAt),
    closesAt: new Date(closesAt),
  }
}

export const getQuestionsInitialValues = (feedbackTarget) => {
  const { surveys } = feedbackTarget

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
    questions,
  }
}

export const saveFeedbackPeriodValues = async (values, feedbackTarget) => {
  const closesAt = values.closesAt ? endOfDay(new Date(values.closesAt)) : null
  const opensAt = values.opensAt ? startOfDay(new Date(values.opensAt)) : null

  const { surveys, id } = feedbackTarget
  const { id: surveyId } = surveys.teacherSurvey

  const payload = {
    surveyId,
    closesAt,
    opensAt,
  }

  const { data } = await apiClient.put(`/feedback-targets/${id}`, payload)

  return data
}

export const saveQuestionsValues = async (values, feedbackTarget) => {
  const { questions } = values
  const { surveys, id } = feedbackTarget
  const { id: surveyId } = surveys.teacherSurvey

  const editableQuestions = questions.filter(({ editable }) => editable)

  const payload = {
    surveyId,
    questions: editableQuestions,
  }

  const { data } = await apiClient.put(`/feedback-targets/${id}`, payload)

  return data
}

export const copyQuestionsFromFeedbackTarget = (feedbackTarget) => {
  const questions = feedbackTarget.surveys?.teacherSurvey?.questions ?? []

  return questions.map((q) => ({
    ...copyQuestion(q),
    editable: true,
  }))
}

export const feedbackTargetIsOpenOrClosed = (feedbackTarget) => {
  const closesAt = new Date(feedbackTarget.closesAt)

  return new Date() > closesAt || feedbackTargetIsOpen(feedbackTarget)
}

export const getOrganisationNames = (feedbackTarget, language) => {
  const { organisations } = feedbackTarget.courseUnit

  if (!organisations) return { primaryOrganisation: 'Helsingin yliopisto' }

  const primaryOrganisation = organisations.find(
    (org) => org.courseUnitOrganisation.type === 'PRIMARY',
  )

  if (organisations.length === 1)
    return { primaryOrganisation: organisations[0].name[language] }

  const lastCode = organisations[organisations.length - 1].code

  const otherOrganisations = organisations.reduce((a, b) => {
    if (b.code === primaryOrganisation.code) return a
    if (b.code === lastCode) return `${a} ${b.name[language]}`
    return `${a}, ${b.name[language]}`
  }, '')

  return {
    primaryOrganisation: primaryOrganisation.name[language],
    otherOrganisations,
  }
}
